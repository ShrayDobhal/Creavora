import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, hashRefreshToken, generateTokenPair, setAuthCookies } from "@/lib/auth";
import { registerSchema, validateBody } from "@/lib/validators";

export async function POST(req) {
  try {
    const body = await req.json();
    const { error, data } = validateBody(registerSchema, body);

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check if handle already exists
    const existingHandle = await db.user.findUnique({
      where: { handle: data.handle },
    });
    if (existingHandle) {
      return NextResponse.json(
        { error: "This handle is already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        handle: data.handle,
        passwordHash,
        role: data.role,
        walletBalance: 0,
        xp: 0,
        level: 1,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.role);

    // Store refresh token
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

    // Create welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to Blindly",
        message:
          data.role === "CREATOR"
            ? "Your creator account is ready. Start uploading content and building your community!"
            : "Start discovering amazing creators and exclusive content!",
        type: "SYSTEM",
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
