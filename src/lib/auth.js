import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// ─── Secrets ────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || (isProduction ? undefined : "creavora-access-secret-dev-only");
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (isProduction ? undefined : "creavora-refresh-secret-dev-only");
const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";

export function normalizeRole(role) {
  return role === "FAN" ? "USER" : role;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

function requireSecret(secret, name) {
  if (!secret) throw new Error(`${name} must be configured in production`);
  return secret;
}

// ─── Password Hashing ──────────────────────────────────────────────────────
const SALT_ROUNDS = 12;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

// ─── JWT Tokens ─────────────────────────────────────────────────────────────
export function signAccessToken(userId, role) {
  return jwt.sign({ sub: userId, role }, requireSecret(ACCESS_SECRET, "JWT_ACCESS_SECRET"), {
    expiresIn: ACCESS_EXPIRES,
  });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: "refresh" }, requireSecret(REFRESH_SECRET, "JWT_REFRESH_SECRET"), {
    expiresIn: REFRESH_EXPIRES,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, requireSecret(ACCESS_SECRET, "JWT_ACCESS_SECRET"));
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, requireSecret(REFRESH_SECRET, "JWT_REFRESH_SECRET"));
  } catch {
    return null;
  }
}

// ─── Cookie Management ─────────────────────────────────────────────────────
export async function setAuthCookies(accessToken, refreshToken) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes
  });
  cookieStore.set("refresh_token", refreshToken, {
    ...COOKIE_OPTIONS,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function hashRefreshToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function clearAuthCookies(cookieStoreOverride) {
  const cookieStore = cookieStoreOverride || await cookies();
  cookieStore.set("access_token", "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.set("refresh_token", "", {
    ...COOKIE_OPTIONS,
    path: "/api/auth",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getTokensFromCookies() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("access_token")?.value || null,
    refreshToken: cookieStore.get("refresh_token")?.value || null,
  };
}

// ─── Extract token from request ─────────────────────────────────────────────
export function extractTokenFromRequest(req) {
  // 1. Try Authorization header (for mobile/API clients)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // 2. Try cookie (for web clients)
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/access_token=([^;]+)/);
  if (match) {
    return match[1];
  }

  return null;
}

// ─── Generate Token Pair ────────────────────────────────────────────────────
export function generateTokenPair(userId, role) {
  const accessToken = signAccessToken(userId, normalizeRole(role));
  const refreshToken = signRefreshToken(userId);
  return { accessToken, refreshToken };
}

export async function issueSession({ database, user, request, setCookies = setAuthCookies, now = () => new Date() }) {
  const role = normalizeRole(user.role);
  const { accessToken, refreshToken } = generateTokenPair(user.id, role);
  const createdAt = now();
  await database.$transaction(async (transaction) => {
    const existingSessions = await transaction.refreshToken.count({
      where: { userId: user.id, revoked: false },
    });
    if (existingSessions >= 5) {
      const oldest = await transaction.refreshToken.findFirst({
        where: { userId: user.id, revoked: false },
        orderBy: { createdAt: "asc" },
      });
      if (oldest) {
        await transaction.refreshToken.update({ where: { id: oldest.id }, data: { revoked: true } });
      }
    }
    await transaction.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });
    await transaction.activityLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        details: `Logged in from ${request.headers.get("user-agent")?.substring(0, 100) || "unknown"}`,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      },
    });
  });
  await setCookies(accessToken, refreshToken);
  return { accessToken, refreshToken, role };
}
