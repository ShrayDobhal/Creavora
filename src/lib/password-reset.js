import { createHash, randomBytes } from "crypto";

export const RESET_MESSAGE = "If an active account matches that email, a reset link has been sent.";
export const INVALID_RESET_ERROR = "This reset link is invalid or expired";

export function resetTokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function rateLimitDigest(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function consumeRateLimitBucket({ transaction, scope, keyHash, maximum, windowMs, currentTime }) {
  let row = await transaction.authRateLimit.upsert({
    where: { scope_keyHash: { scope, keyHash } },
    create: { scope, keyHash, windowStartedAt: currentTime, attempts: 0 },
    update: {},
  });

  for (let retry = 0; retry < 3; retry += 1) {
    const expired = currentTime.getTime() - row.windowStartedAt.getTime() >= windowMs;
    if (!expired && row.attempts >= maximum) return false;

    const update = await transaction.authRateLimit.updateMany({
      where: {
        id: row.id,
        attempts: row.attempts,
        windowStartedAt: row.windowStartedAt,
      },
      data: expired
        ? { attempts: 1, windowStartedAt: currentTime }
        : { attempts: { increment: 1 } },
    });
    if (update.count === 1) return true;
    row = await transaction.authRateLimit.findUnique({ where: { id: row.id } });
    if (!row) throw new Error("Auth rate limit row disappeared");
  }
  throw new Error("Auth rate limit contention exceeded retries");
}

export async function consumePasswordResetAttempt({ database, normalizedEmail, ipAddress, now = () => new Date() }) {
  const currentTime = now();
  return database.$transaction(async (transaction) => {
    const emailAllowed = await consumeRateLimitBucket({
      transaction,
      scope: "PASSWORD_RESET_EMAIL",
      keyHash: rateLimitDigest(`email:${normalizedEmail}`),
      maximum: 3,
      windowMs: 60 * 60 * 1000,
      currentTime,
    });
    if (!emailAllowed) return false;
    return consumeRateLimitBucket({
      transaction,
      scope: "PASSWORD_RESET_IP",
      keyHash: rateLimitDigest(`ip:${ipAddress}`),
      maximum: 5,
      windowMs: 60 * 60 * 1000,
      currentTime,
    });
  });
}

export function randomResetToken() {
  return randomBytes(32).toString("base64url");
}

export async function sendPasswordResetEmail({ env, email, resetUrl, fetchImpl = fetch }) {
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
      "user-agent": "Blindly password recovery/1.0",
    },
    body: JSON.stringify({
      from: env.PASSWORD_RESET_FROM_EMAIL,
      to: [email],
      subject: "Reset your Blindly password",
      text: `Open this secure link to reset your Blindly password: ${resetUrl}\n\nThis link expires in 30 minutes.`,
      html: `<p>Open this secure link to reset your Blindly password:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 30 minutes.</p>`,
    }),
  });
  if (!response.ok) throw new Error("Password reset email delivery failed");
}
