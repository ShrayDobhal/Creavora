import { createHash, randomBytes } from "crypto";

export const RESET_MESSAGE = "If an active account matches that email, a reset link has been sent.";
export const INVALID_RESET_ERROR = "This reset link is invalid or expired";

export function resetTokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
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
