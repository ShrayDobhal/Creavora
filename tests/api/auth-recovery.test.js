import { createHash } from "crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { createForgotPasswordPost } from "@/app/api/auth/forgot-password/route";
import { createResetPasswordPost } from "@/app/api/auth/reset-password/route";
import { consumePasswordResetAttempt, rateLimitDigest } from "@/lib/password-reset";

const env = {
  NEXT_PUBLIC_APP_URL: "https://blindly.example",
  RESEND_API_KEY: "resend-key",
  PASSWORD_RESET_FROM_EMAIL: "Blindly <hello@blindly.example>",
};
const genericMessage = "If an active account matches that email, a reset link has been sent.";

const postJson = (path, body, headers = {}) => new Request(`https://blindly.example${path}`, {
  method: "POST",
  headers: { "content-type": "application/json", ...headers },
  body: JSON.stringify(body),
});

describe("forgot password", () => {
  it("returns 503 and does not query when recovery is unavailable", async () => {
    const database = { user: { findFirst: vi.fn() } };
    const response = await createForgotPasswordPost({ env: {}, database })(
      postJson("/api/auth/forgot-password", { email: "fan@example.test" }),
    );
    expect(response.status).toBe(503);
    expect(database.user.findFirst).not.toHaveBeenCalled();
  });

  it("returns the generic response and creates nothing when either durable limit is exceeded", async () => {
    const database = { user: { findFirst: vi.fn() }, $transaction: vi.fn() };
    const checkRateLimit = vi.fn().mockResolvedValue(false);
    const sendResetEmail = vi.fn();
    const randomToken = vi.fn();
    const response = await createForgotPasswordPost({ env, database, checkRateLimit, sendResetEmail, randomToken })(
      postJson(
        "/api/auth/forgot-password",
        { email: "fan@example.test" },
        { "x-vercel-forwarded-for": "203.0.113.7, 10.0.0.1", "x-forwarded-for": "198.51.100.9" },
      ),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: genericMessage });
    expect(database.user.findFirst).not.toHaveBeenCalled();
    expect(sendResetEmail).not.toHaveBeenCalled();
    expect(randomToken).not.toHaveBeenCalled();
    expect(checkRateLimit).toHaveBeenCalledWith(expect.objectContaining({
      normalizedEmail: "fan@example.test",
      ipAddress: "203.0.113.7",
    }));
  });

  it("fails closed with the same generic response when the limiter database operation fails", async () => {
    const database = { user: { findFirst: vi.fn() } };
    const sendResetEmail = vi.fn();
    const response = await createForgotPasswordPost({
      env,
      database,
      sendResetEmail,
      checkRateLimit: vi.fn().mockRejectedValue(new Error("database unavailable")),
    })(postJson("/api/auth/forgot-password", { email: "fan@example.test" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: genericMessage });
    expect(database.user.findFirst).not.toHaveBeenCalled();
    expect(sendResetEmail).not.toHaveBeenCalled();
  });

  it("uses the same response for unknown and eligible accounts while storing only a token hash", async () => {
    const now = new Date("2026-08-05T10:00:00.000Z");
    const rawToken = "raw-reset-token";
    const passwordResetToken = { create: vi.fn(), updateMany: vi.fn() };
    const database = {
      user: { findFirst: vi.fn().mockResolvedValue({ id: "user-1", email: "fan@example.test" }) },
      passwordResetToken,
      $transaction: (callback) => callback({ passwordResetToken }),
    };
    const sendResetEmail = vi.fn().mockResolvedValue(undefined);
    const handler = createForgotPasswordPost({
      env,
      database,
      now: () => now,
      randomToken: () => rawToken,
      sendResetEmail,
      checkRateLimit: vi.fn().mockResolvedValue(true),
    });

    const response = await handler(postJson("/api/auth/forgot-password", { email: " FAN@Example.Test " }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: genericMessage });
    expect(passwordResetToken.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      userId: "user-1",
      tokenHash: createHash("sha256").update(rawToken).digest("hex"),
      expiresAt: new Date("2026-08-05T10:30:00.000Z"),
    }) });
    expect(JSON.stringify(passwordResetToken.create.mock.calls)).not.toContain(rawToken);
    expect(sendResetEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: "fan@example.test",
      resetUrl: `https://blindly.example/reset-password#token=${rawToken}`,
    }));

    database.user.findFirst.mockResolvedValueOnce(null);
    const unknown = await handler(postJson("/api/auth/forgot-password", { email: "missing@example.test" }));
    expect(await unknown.json()).toEqual({ message: genericMessage });
  });
});

describe("durable forgot-password limits", () => {
  it("persists only scoped SHA-256 email and Vercel-forwarded IP digests below the limits", async () => {
    const now = new Date("2026-08-05T10:00:00.000Z");
    const authRateLimit = {
      upsert: vi.fn()
        .mockResolvedValueOnce({ id: "email-limit", attempts: 0, windowStartedAt: now })
        .mockResolvedValueOnce({ id: "ip-limit", attempts: 0, windowStartedAt: now }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    };
    const database = { $transaction: (callback) => callback({ authRateLimit }) };
    await expect(consumePasswordResetAttempt({
      database,
      normalizedEmail: "fan@example.test",
      ipAddress: "203.0.113.7",
      now: () => now,
    })).resolves.toBe(true);

    const calls = JSON.stringify([authRateLimit.upsert.mock.calls, authRateLimit.updateMany.mock.calls]);
    expect(calls).toContain(rateLimitDigest("email:fan@example.test"));
    expect(calls).toContain(rateLimitDigest("ip:203.0.113.7"));
    expect(calls).not.toContain("fan@example.test");
    expect(calls).not.toContain("203.0.113.7");
  });

  it("denies an email already at three attempts in the active hour", async () => {
    const now = new Date("2026-08-05T10:30:00.000Z");
    const authRateLimit = {
      upsert: vi.fn().mockResolvedValue({ id: "email-limit", attempts: 3, windowStartedAt: new Date("2026-08-05T10:00:00.000Z") }),
      updateMany: vi.fn(),
    };
    const database = { $transaction: (callback) => callback({ authRateLimit }) };
    await expect(consumePasswordResetAttempt({
      database,
      normalizedEmail: "fan@example.test",
      ipAddress: "203.0.113.7",
      now: () => now,
    })).resolves.toBe(false);
    expect(authRateLimit.updateMany).not.toHaveBeenCalled();
  });
});

describe("reset password", () => {
  it("returns 503 without reading tokens when recovery is unavailable", async () => {
    const database = { $transaction: vi.fn() };
    const response = await createResetPasswordPost({ env: {}, database })(
      postJson("/api/auth/reset-password", { token: "unknown-token", password: "Strong123" }),
    );
    expect(response.status).toBe(503);
    expect(database.$transaction).not.toHaveBeenCalled();
  });

  it("rejects an invalid token with a generic error", async () => {
    const tx = { passwordResetToken: { findUnique: vi.fn().mockResolvedValue(null) } };
    const database = { $transaction: (callback) => callback(tx) };
    const hashPassword = vi.fn();
    const response = await createResetPasswordPost({ env, database, hashPassword })(
      postJson("/api/auth/reset-password", { token: "unknown-token", password: "Strong123" }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "This reset link is invalid or expired" });
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it("does not reset a banned account even when an old token has not expired", async () => {
    const updateMany = vi.fn();
    const tx = {
      passwordResetToken: {
        findUnique: vi.fn().mockResolvedValue({
          id: "reset-1", userId: "user-1", usedAt: null,
          expiresAt: new Date("2026-08-05T10:10:00.000Z"),
          user: { deletedAt: null, banned: true },
        }),
        updateMany,
      },
    };
    const database = { $transaction: (callback) => callback(tx) };
    const hashPassword = vi.fn();
    const response = await createResetPasswordPost({
      env,
      database,
      now: () => new Date("2026-08-05T10:00:00.000Z"),
      hashPassword,
    })(postJson("/api/auth/reset-password", { token: "old-token", password: "Strong123" }));

    expect(response.status).toBe(400);
    expect(updateMany).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it("claims a valid token once, updates the password, and revokes refresh sessions atomically", async () => {
    const now = new Date("2026-08-05T10:00:00.000Z");
    const token = "valid-reset-token";
    const tx = {
      passwordResetToken: {
        findUnique: vi.fn().mockResolvedValue({
          id: "reset-1", userId: "user-1", usedAt: null,
          expiresAt: new Date("2026-08-05T10:10:00.000Z"), user: { deletedAt: null },
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      user: { update: vi.fn() },
      refreshToken: { updateMany: vi.fn() },
      activityLog: { create: vi.fn() },
    };
    const database = { $transaction: vi.fn((callback) => callback(tx)) };
    const hashPassword = vi.fn().mockResolvedValue("bcrypt-hash");
    const clearCookies = vi.fn();
    const response = await createResetPasswordPost({ env, database, now: () => now, hashPassword, clearCookies })(
      postJson("/api/auth/reset-password", { token, password: "Strong123" }),
    );

    expect(response.status).toBe(200);
    expect(tx.passwordResetToken.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { tokenHash: createHash("sha256").update(token).digest("hex") },
    }));
    expect(tx.passwordResetToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "reset-1", usedAt: null }),
    }));
    expect(tx.user.update).toHaveBeenCalledWith({ where: { id: "user-1" }, data: { passwordHash: "bcrypt-hash" } });
    expect(tx.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", revoked: false }, data: { revoked: true },
    });
    expect(clearCookies).toHaveBeenCalledOnce();
  });
});
