import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issueSession, normalizeRole, verifyPassword } from "@/lib/auth";
import { loginSchema, validateBody } from "@/lib/validators";

export async function POST(req) {
  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
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

    const { accessToken } = await issueSession({ database: db, user, request: req });

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
