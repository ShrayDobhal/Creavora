import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyRefreshToken,
  generateTokenPair,
  setAuthCookies,
  getTokensFromCookies,
} from "@/lib/auth";

export async function POST(req) {
  try {
    const { refreshToken: cookieRefresh } = await getTokensFromCookies();

    // Also accept refresh token from body (mobile clients)
    let refreshToken = cookieRefresh;
    if (!refreshToken) {
      try {
        const body = await req.json();
        refreshToken = body.refreshToken;
      } catch {
        // No body, that's fine
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token required" },
        { status: 401 }
      );
    }

    // Verify the refresh token JWT
    const payload = verifyRefreshToken(refreshToken);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Check the token exists in DB and is not revoked
    const storedToken = await db.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.sub,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      // Possible token reuse attack — revoke ALL tokens for this user
      await db.refreshToken.updateMany({
        where: { userId: payload.sub },
        data: { revoked: true },
      });
      return NextResponse.json(
        { error: "Refresh token has been revoked. Please log in again." },
        { status: 401 }
      );
    }

    // Get the user
    const user = await db.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Rotate: revoke old token, issue new pair
    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const { accessToken: newAccess, refreshToken: newRefresh } = generateTokenPair(
      user.id,
      user.role
    );

    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefresh,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    await setAuthCookies(newAccess, newRefresh);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken: newAccess,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
