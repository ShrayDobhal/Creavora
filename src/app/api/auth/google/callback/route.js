import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issueSession } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";
import {
  constantTimeEqual,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  getAuthProviderStatus,
  oauthCookieOptions,
  OAUTH_COOKIE_NAMES,
  parseCookieHeader,
  resolveGoogleUser,
  trustedAppOrigin,
} from "@/lib/auth-providers";

function clearOAuthCookies(response, env) {
  const options = { ...oauthCookieOptions(env), maxAge: 0 };
  for (const name of Object.values(OAUTH_COOKIE_NAMES)) response.cookies.set(name, "", options);
  return response;
}

function failureResponse(env, role = "USER") {
  const origin = trustedAppOrigin(env) || "http://localhost";
  const login = role === "CREATOR" ? "/creator-login" : "/login";
  const url = new URL(login, origin);
  url.searchParams.set("error", "google_sign_in_failed");
  return clearOAuthCookies(NextResponse.redirect(url), env);
}

export function createGoogleCallbackGet({
  env = process.env,
  database = db,
  exchangeCode = exchangeGoogleCode,
  getUserInfo = fetchGoogleUserInfo,
  resolveUser = resolveGoogleUser,
  issueAuthSession = issueSession,
} = {}) {
  return async function googleCallback(request) {
    const cookies = parseCookieHeader(request);
    const role = cookies[OAUTH_COOKIE_NAMES.role] === "CREATOR" ? "CREATOR" : "USER";
    if (!getAuthProviderStatus(env).google) {
      return clearOAuthCookies(
        NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 }),
        env,
      );
    }
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (url.searchParams.has("error") || !code || !constantTimeEqual(state, cookies[OAUTH_COOKIE_NAMES.state]) || !cookies[OAUTH_COOKIE_NAMES.verifier]) {
      return failureResponse(env, role);
    }
    try {
      const accessToken = await exchangeCode({ env, code, verifier: cookies[OAUTH_COOKIE_NAMES.verifier] });
      const profile = await getUserInfo({ accessToken });
      const user = await resolveUser({ database, profile, intentRole: role });
      await issueAuthSession({ database, user, request });
      const fallback = role === "CREATOR" ? "/studio/content" : "/";
      const redirect = safeRedirectPath(cookies[OAUTH_COOKIE_NAMES.redirect], fallback);
      return clearOAuthCookies(NextResponse.redirect(new URL(redirect, trustedAppOrigin(env))), env);
    } catch {
      return failureResponse(env, role);
    }
  };
}

export const GET = createGoogleCallbackGet();
