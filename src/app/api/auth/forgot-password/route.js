import { NextResponse } from "next/server";
import { isIP } from "node:net";
import { db } from "@/lib/db";
import { forgotPasswordSchema, validateBody } from "@/lib/validators";
import { getAuthProviderStatus, trustedAppOrigin } from "@/lib/auth-providers";
import { consumePasswordResetAttempt, randomResetToken, RESET_MESSAGE, resetTokenHash, sendPasswordResetEmail } from "@/lib/password-reset";

function clientIpAddress(request) {
  for (const header of ["x-vercel-forwarded-for", "x-real-ip"]) {
    const candidate = request.headers.get(header)?.split(",")[0]?.trim();
    if (candidate && isIP(candidate)) return candidate;
  }
  return "unknown";
}

export function createForgotPasswordPost({
  env = process.env,
  database = db,
  now = () => new Date(),
  randomToken = randomResetToken,
  sendResetEmail = ({ email, resetUrl }) => sendPasswordResetEmail({ env, email, resetUrl }),
  checkRateLimit = consumePasswordResetAttempt,
} = {}) {
  return async function forgotPassword(request) {
    if (!getAuthProviderStatus(env).passwordReset) {
      return NextResponse.json({ error: "Password recovery is not configured" }, { status: 503 });
    }
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
    const parsed = validateBody(forgotPasswordSchema, body);
    if (parsed.error) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    let allowed = false;
    try {
      allowed = await checkRateLimit({
        database,
        normalizedEmail: parsed.data.email,
        ipAddress: clientIpAddress(request),
        now,
      });
    } catch {
      console.error("Password reset rate limiter unavailable");
      return NextResponse.json({ message: RESET_MESSAGE });
    }
    if (!allowed) return NextResponse.json({ message: RESET_MESSAGE });
    const user = await database.user.findFirst({ where: { email: parsed.data.email, deletedAt: null, banned: false } });
    if (user) {
      const token = randomToken();
      const createdAt = now();
      await database.$transaction(async (transaction) => {
        await transaction.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: createdAt } });
        await transaction.passwordResetToken.create({ data: {
          userId: user.id,
          tokenHash: resetTokenHash(token),
          expiresAt: new Date(createdAt.getTime() + 30 * 60 * 1000),
        } });
      });
      try {
        await sendResetEmail({ email: user.email, resetUrl: `${trustedAppOrigin(env)}/reset-password#token=${token}` });
      } catch (error) {
        console.error("Password reset email delivery failed", error instanceof Error ? error.message : "unknown error");
      }
    }
    return NextResponse.json({ message: RESET_MESSAGE });
  };
}

export const POST = createForgotPasswordPost();
