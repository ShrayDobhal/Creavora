import { expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { POST } from "@/app/api/auth/login/route";
import { clearAuthCookies, hashRefreshToken, issueSession } from "@/lib/auth";

it("returns a client error when the login body is malformed JSON", async () => {
  const response = await POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
  );

  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Invalid JSON body" });
});

it("issues the shared Blindly session and keeps at most five active refresh sessions", async () => {
  const oldest = { id: "refresh-oldest" };
  const transaction = {
    refreshToken: {
      count: vi.fn().mockResolvedValue(5),
      findFirst: vi.fn().mockResolvedValue(oldest),
      update: vi.fn(),
      create: vi.fn(),
    },
    activityLog: { create: vi.fn() },
  };
  const database = { $transaction: vi.fn((callback) => callback(transaction)) };
  const setCookies = vi.fn();
  const request = new Request("https://blindly.example/api/auth/login", {
    headers: { "user-agent": "Vitest browser", "x-forwarded-for": "203.0.113.7" },
  });
  const result = await issueSession({
    database,
    user: { id: "user-1", role: "USER" },
    request,
    setCookies,
    now: () => new Date("2026-08-05T10:00:00.000Z"),
  });

  expect(transaction.refreshToken.update).toHaveBeenCalledWith({ where: { id: oldest.id }, data: { revoked: true } });
  expect(transaction.refreshToken.create).toHaveBeenCalledWith({ data: expect.objectContaining({
    userId: "user-1",
    tokenHash: hashRefreshToken(result.refreshToken),
    expiresAt: new Date("2026-08-12T10:00:00.000Z"),
    userAgent: "Vitest browser",
  }) });
  expect(setCookies).toHaveBeenCalledWith(result.accessToken, result.refreshToken);
  expect(transaction.activityLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({ action: "LOGIN" }) });
});

it("does not set cookies or leave partial session persistence when activity logging fails", async () => {
  const setCookies = vi.fn();
  const transaction = {
    refreshToken: {
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    activityLog: { create: vi.fn().mockRejectedValue(new Error("audit unavailable")) },
  };
  const database = { $transaction: vi.fn(async (callback) => callback(transaction)) };

  await expect(issueSession({
    database,
    user: { id: "user-1", role: "USER" },
    request: new Request("https://blindly.example/api/auth/login"),
    setCookies,
  })).rejects.toThrow("audit unavailable");

  expect(database.$transaction).toHaveBeenCalledTimes(1);
  expect(transaction.refreshToken.create).toHaveBeenCalledTimes(1);
  expect(setCookies).not.toHaveBeenCalled();
});

it("clears the refresh cookie with the same /api/auth path used when it was created", async () => {
  const cookieStore = { set: vi.fn(), delete: vi.fn() };
  await clearAuthCookies(cookieStore);
  expect(cookieStore.set).toHaveBeenCalledWith("refresh_token", "", expect.objectContaining({
    path: "/api/auth",
    maxAge: 0,
  }));
});
