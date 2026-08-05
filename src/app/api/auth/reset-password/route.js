import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearAuthCookies, hashPassword as hashBlindlyPassword } from "@/lib/auth";
import { resetPasswordSchema, validateBody } from "@/lib/validators";
import { INVALID_RESET_ERROR, resetTokenHash } from "@/lib/password-reset";
import { getAuthProviderStatus } from "@/lib/auth-providers";

const invalidReset = () => NextResponse.json({ error: INVALID_RESET_ERROR }, { status: 400 });

export function createResetPasswordPost({
  env = process.env,
  database = db,
  now = () => new Date(),
  hashPassword = hashBlindlyPassword,
  clearCookies = clearAuthCookies,
} = {}) {
  return async function resetPassword(request) {
    if (!getAuthProviderStatus(env).passwordReset) {
      return NextResponse.json({ error: "Password recovery is not configured" }, { status: 503 });
    }
    let body;
    try { body = await request.json(); } catch { return invalidReset(); }
    const parsed = validateBody(resetPasswordSchema, body);
    if (parsed.error) return invalidReset();
    const changedAt = now();
    const updated = await database.$transaction(async (transaction) => {
      const reset = await transaction.passwordResetToken.findUnique({
        where: { tokenHash: resetTokenHash(parsed.data.token) },
        include: { user: { select: { deletedAt: true, banned: true } } },
      });
      if (!reset || reset.usedAt || reset.expiresAt <= changedAt || reset.user.deletedAt || reset.user.banned) return false;
      const claimed = await transaction.passwordResetToken.updateMany({
        where: { id: reset.id, usedAt: null, expiresAt: { gt: changedAt } },
        data: { usedAt: changedAt },
      });
      if (claimed.count !== 1) return false;
      const passwordHash = await hashPassword(parsed.data.password);
      await transaction.user.update({ where: { id: reset.userId }, data: { passwordHash } });
      await transaction.refreshToken.updateMany({ where: { userId: reset.userId, revoked: false }, data: { revoked: true } });
      await transaction.passwordResetToken.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: changedAt } });
      await transaction.activityLog.create({ data: { userId: reset.userId, action: "PASSWORD_RESET", details: "Password reset completed" } });
      return true;
    });
    if (!updated) return invalidReset();
    await clearCookies();
    return NextResponse.json({ message: "Password updated. You can now sign in." });
  };
}

export const POST = createResetPasswordPost();
