import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashRefreshToken, normalizeRole, verifyPassword, generateTokenPair, setAuthCookies } from "@/lib/auth";
import { loginSchema, validateBody } from "@/lib/validators";

export async function POST(req) {
  try {
    const body = await req.json();
    const { error, data } = validateBody(loginSchema, body);

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    // Find user by email
    const user = await db.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If a specific role is requested, verify the user has that role
    const role = normalizeRole(user.role);
    if (data.role && role !== data.role) {
      const roleLabel = data.role === "CREATOR" ? "Creator" : "User";
      return NextResponse.json(
        { error: `This account is not registered as a ${roleLabel}. Please use the correct login.` },
        { status: 403 }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user.id, role);

    // Store refresh token (limit to 5 active sessions per user)
    const existingSessions = await db.refreshToken.count({
      where: { userId: user.id, revoked: false },
    });
    if (existingSessions >= 5) {
      // Revoke oldest session
      const oldest = await db.refreshToken.findFirst({
        where: { userId: user.id, revoked: false },
        orderBy: { createdAt: "asc" },
      });
      if (oldest) {
        await db.refreshToken.update({
          where: { id: oldest.id },
          data: { revoked: true },
        });
      }
    }

    await db.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        details: `Logged in from ${req.headers.get("user-agent")?.substring(0, 100) || "unknown"}`,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        role,
        avatar: user.avatar,
        verified: user.verified,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
