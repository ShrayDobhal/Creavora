import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { safeRedirectPath } from "@/lib/safe-redirect";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const OAUTH_COOKIE_NAMES = {
  state: "blindly_oauth_state",
  verifier: "blindly_oauth_verifier",
  redirect: "blindly_oauth_redirect",
  role: "blindly_oauth_role",
};

export function trustedAppOrigin(env = process.env) {
  try {
    const url = new URL(env.NEXT_PUBLIC_APP_URL || "");
    const localHttp = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]");
    if ((!localHttp && url.protocol !== "https:") || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getAuthProviderStatus(env = process.env) {
  const origin = trustedAppOrigin(env);
  return {
    google: Boolean(origin && env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim()),
    passwordReset: Boolean(origin && env.RESEND_API_KEY?.trim() && env.PASSWORD_RESET_FROM_EMAIL?.trim()),
  };
}

export function randomUrlToken(size = 32) {
  return randomBytes(size).toString("base64url");
}

export function buildPkceChallenge(verifier) {
  return createHash("sha256").update(verifier, "ascii").digest("base64url");
}

export function googleCallbackUrl(env = process.env) {
  const origin = trustedAppOrigin(env);
  return origin ? `${origin}/api/auth/google/callback` : null;
}

export function buildGoogleAuthorizationUrl({ env, state, verifier }) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: googleCallbackUrl(env),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: buildPkceChallenge(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url;
}

export function oauthCookieOptions(env = process.env) {
  return { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production", path: "/api/auth/google/callback", maxAge: 10 * 60 };
}

export function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function parseCookieHeader(request) {
  const entries = [];
  for (const part of (request.headers.get("cookie") || "").split(";").map((value) => value.trim()).filter(Boolean)) {
    const split = part.indexOf("=");
    if (split <= 0) continue;
    const name = part.slice(0, split);
    const rawValue = part.slice(split + 1);
    try {
      entries.push([name, decodeURIComponent(rawValue)]);
    } catch {
      entries.push([name, rawValue]);
    }
  }
  return Object.fromEntries(entries);
}

export async function exchangeGoogleCode({ env, code, verifier, fetchImpl = fetch }) {
  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: googleCallbackUrl(env),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!response.ok) throw new Error("Google token exchange failed");
  const data = await response.json();
  if (!data.access_token || (data.token_type && data.token_type.toLowerCase() !== "bearer")) throw new Error("Google token response was invalid");
  return data.access_token;
}

export async function fetchGoogleUserInfo({ accessToken, fetchImpl = fetch }) {
  const response = await fetchImpl(GOOGLE_USERINFO_URL, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error("Google profile request failed");
  const data = await response.json();
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!data.sub || !/^\S+@\S+\.\S+$/.test(email) || data.email_verified !== true) throw new Error("Google profile was not verified");
  return { subject: String(data.sub), email, name: typeof data.name === "string" ? data.name.trim().slice(0, 100) : "Blindly member" };
}

function googleHandle(email, subject, attempt = 0) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "member";
  return `${base}_${createHash("sha256").update(`${subject}:${attempt}`).digest("hex").slice(0, 8)}`;
}

export async function resolveGoogleUser({ database, profile, intentRole }) {
  let lastConflict;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await database.$transaction(async (transaction) => {
        const bySubject = await transaction.user.findUnique({ where: { googleSubject: profile.subject } });
        if (bySubject) {
          if (bySubject.deletedAt || bySubject.banned || bySubject.role !== intentRole) throw new Error("Google account cannot use this portal");
          return bySubject;
        }
        const emailMatches = await transaction.user.findMany({
          where: { email: { equals: profile.email, mode: "insensitive" } },
          take: 2,
        });
        if (emailMatches.length > 1) throw new Error("Google account email is ambiguous");
        const byEmail = emailMatches[0];
        if (byEmail) {
          if (byEmail.deletedAt || byEmail.banned || byEmail.role !== intentRole || (byEmail.googleSubject && byEmail.googleSubject !== profile.subject)) {
            throw new Error("Google account cannot be linked");
          }
          const linked = await transaction.user.updateMany({
            where: { id: byEmail.id, googleSubject: null },
            data: { googleSubject: profile.subject },
          });
          if (linked.count !== 1) {
            const concurrentLink = await transaction.user.findUnique({ where: { googleSubject: profile.subject } });
            if (
              concurrentLink?.id !== byEmail.id
              || concurrentLink.googleSubject !== profile.subject
              || concurrentLink.deletedAt
              || concurrentLink.banned
              || concurrentLink.role !== intentRole
            ) {
              throw new Error("Google account linking conflict");
            }
            return concurrentLink;
          }
          return { ...byEmail, googleSubject: profile.subject };
        }
        if (intentRole !== "USER") throw new Error("Creator account not found");
        return transaction.user.create({ data: {
          name: profile.name || "Blindly member",
          email: profile.email,
          handle: googleHandle(profile.email, profile.subject, attempt),
          googleSubject: profile.subject,
          role: "USER",
          passwordHash: null,
        } });
      });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
      lastConflict = error;
    }
  }
  throw lastConflict || new Error("Unable to resolve Google account");
}

export function oauthIntent(requestUrl) {
  const url = new URL(requestUrl);
  const role = url.searchParams.get("role") === "CREATOR" ? "CREATOR" : "USER";
  const fallback = role === "CREATOR" ? "/studio/content" : "/";
  return { role, redirect: safeRedirectPath(url.searchParams.get("redirect"), fallback) };
}
