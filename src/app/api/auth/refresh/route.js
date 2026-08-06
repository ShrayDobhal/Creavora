import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyRefreshToken,
  hashRefreshToken,
  normalizeRole,
  generateTokenPair,
  setAuthCookies,
  getTokensFromCookies,
  REFRESH_SESSION_MS,
  clearAuthCookies,
} from "@/lib/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";

async function rotateSession(req, { allowBody = false } = {}) {
    const { refreshToken: cookieRefresh } = await getTokensFromCookies();

    // Also accept refresh token from body (mobile clients)
    let refreshToken = cookieRefresh;
    if (!refreshToken && allowBody) {
      try {
        const body = await req.json();
        refreshToken = body.refreshToken;
      } catch {
        // No body, that's fine
      }
    }

    if (!refreshToken) {
      return { error: "Refresh token required", status: 401 };
    }

    // Verify the refresh token JWT
    const payload = verifyRefreshToken(refreshToken);
    if (!payload || !payload.sub) {
      return { error: "Invalid refresh token", status: 401 };
    }

    // Check the token exists in DB and is not revoked
    const storedToken = await db.refreshToken.findFirst({
      where: {
        tokenHash: hashRefreshToken(refreshToken),
        userId: payload.sub,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      // Another request from this browser may already have rotated this token.
      return { error: "Refresh token has been revoked. Please log in again.", status: 401 };
    }

    // Get the user
    const user = await db.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
    });

    if (!user) {
      return { error: "User not found", status: 401 };
    }

    // Rotate: revoke old token, issue new pair
    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const { accessToken: newAccess, refreshToken: newRefresh } = generateTokenPair(
      user.id,
      normalizeRole(user.role)
    );

    await db.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(newRefresh),
        expiresAt: new Date(Date.now() + REFRESH_SESSION_MS),
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    await setAuthCookies(newAccess, newRefresh);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        role: normalizeRole(user.role),
        avatar: user.avatar,
      },
      accessToken: newAccess,
    };
}

export async function POST(req) {
  try {
    const result = await rotateSession(req, { allowBody: true });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const destination = safeRedirectPath(
    new URL(req.url).searchParams.get("redirect"),
    "/",
  );
  try {
    const result = await rotateSession(req);
    if (result.error) {
      await clearAuthCookies();
      const login = new URL("/login", req.url);
      login.searchParams.set("redirect", destination);
      return NextResponse.redirect(login);
    }
    return NextResponse.redirect(new URL(destination, req.url));
  } catch (error) {
    console.error("Browser Session Refresh Error:", error);
    await clearAuthCookies();
    const login = new URL("/login", req.url);
    login.searchParams.set("redirect", destination);
    return NextResponse.redirect(login);
  }
}
