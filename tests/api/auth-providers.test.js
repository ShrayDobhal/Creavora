import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import {
  buildPkceChallenge,
  getAuthProviderStatus,
  resolveGoogleUser,
} from "@/lib/auth-providers";
import { createProvidersGet } from "@/app/api/auth/providers/route";
import { createGoogleStartGet } from "@/app/api/auth/google/start/route";
import { createGoogleCallbackGet } from "@/app/api/auth/google/callback/route";

const configuredEnv = {
  NEXT_PUBLIC_APP_URL: "https://blindly.example",
  GOOGLE_CLIENT_ID: "client-id",
  GOOGLE_CLIENT_SECRET: "client-secret",
  RESEND_API_KEY: "resend-key",
  PASSWORD_RESET_FROM_EMAIL: "Blindly <hello@blindly.example>",
  NODE_ENV: "production",
};

describe("auth provider configuration", () => {
  it("keeps both providers unavailable without complete configuration", () => {
    expect(getAuthProviderStatus({})).toEqual({ google: false, passwordReset: false });
    expect(getAuthProviderStatus({ ...configuredEnv, GOOGLE_CLIENT_SECRET: "" })).toEqual({
      google: false,
      passwordReset: true,
    });
    expect(getAuthProviderStatus({ ...configuredEnv, NEXT_PUBLIC_APP_URL: "https://blindly.example/path" })).toEqual({
      google: false,
      passwordReset: false,
    });
  });

  it("accepts HTTPS origins and local HTTP development origins but rejects remote HTTP", () => {
    expect(getAuthProviderStatus({ ...configuredEnv, NEXT_PUBLIC_APP_URL: "http://localhost:3000" }).google).toBe(true);
    expect(getAuthProviderStatus({ ...configuredEnv, NEXT_PUBLIC_APP_URL: "http://blindly.example" }).google).toBe(false);
  });

  it("returns only provider booleans and disables caching", async () => {
    const response = await createProvidersGet({ env: configuredEnv })();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ google: true, passwordReset: true });
  });
});

describe("Google OAuth start", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 503 without making an external request when Google is unavailable", async () => {
    const fetchImpl = vi.fn();
    const response = await createGoogleStartGet({ env: {}, fetchImpl })(
      new Request("https://blindly.example/api/auth/google/start"),
    );

    expect(response.status).toBe(503);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("uses state and PKCE S256 cookies with a trusted callback and safe user redirect", async () => {
    const verifier = "v".repeat(43);
    const state = "s".repeat(43);
    const response = await createGoogleStartGet({
      env: configuredEnv,
      randomToken: vi.fn().mockReturnValueOnce(state).mockReturnValueOnce(verifier),
    })(new Request("https://blindly.example/api/auth/google/start?role=USER&redirect=https://evil.example"));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location"));
    expect(location.origin + location.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(location.searchParams.get("state")).toBe(state);
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(location.searchParams.get("code_challenge")).toBe(buildPkceChallenge(verifier));
    expect(location.searchParams.get("redirect_uri")).toBe("https://blindly.example/api/auth/google/callback");
    expect(location.searchParams.get("scope")).toBe("openid email profile");

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("blindly_oauth_state=");
    expect(setCookie).toContain("blindly_oauth_verifier=");
    expect(setCookie).toContain("blindly_oauth_redirect=%2F");
    expect(setCookie).toContain("blindly_oauth_role=USER");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=lax");
    expect(setCookie).toContain("Path=/api/auth/google/callback");
  });
});

describe("Google OAuth callback", () => {
  const callbackCookies = [
    `blindly_oauth_state=${"s".repeat(43)}`,
    `blindly_oauth_verifier=${"v".repeat(43)}`,
    "blindly_oauth_redirect=%2Fhome",
    "blindly_oauth_role=USER",
  ].join("; ");

  it("returns 503 without provider calls and clears transient cookies after configuration loss", async () => {
    const exchangeCode = vi.fn();
    const response = await createGoogleCallbackGet({ env: {}, exchangeCode })(new Request(
      `https://blindly.example/api/auth/google/callback?code=abc&state=${"s".repeat(43)}`,
      { headers: { cookie: callbackCookies } },
    ));

    expect(response.status).toBe(503);
    expect(exchangeCode).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toContain("blindly_oauth_state=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("links a verified profile, issues a Blindly session, clears intent, and redirects locally", async () => {
    const user = { id: "user-1", role: "USER", deletedAt: null, banned: false };
    const exchangeCode = vi.fn().mockResolvedValue("google-access-token");
    const getUserInfo = vi.fn().mockResolvedValue({ subject: "google-sub", email: "fan@example.test", name: "Fan" });
    const resolveUser = vi.fn().mockResolvedValue(user);
    const issueAuthSession = vi.fn().mockResolvedValue({ accessToken: "blindly-access" });
    const response = await createGoogleCallbackGet({
      env: configuredEnv, database: {}, exchangeCode, getUserInfo, resolveUser, issueAuthSession,
    })(new Request(
      `https://blindly.example/api/auth/google/callback?code=abc&state=${"s".repeat(43)}`,
      { headers: { cookie: callbackCookies, "user-agent": "Vitest" } },
    ));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")).pathname).toBe("/home");
    expect(exchangeCode).toHaveBeenCalledWith(expect.objectContaining({ code: "abc", verifier: "v".repeat(43) }));
    expect(getUserInfo).toHaveBeenCalledWith({ accessToken: "google-access-token" });
    expect(resolveUser).toHaveBeenCalledWith(expect.objectContaining({ profile: expect.objectContaining({ subject: "google-sub" }), intentRole: "USER" }));
    expect(issueAuthSession).toHaveBeenCalledWith(expect.objectContaining({ user }));
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects a state mismatch before exchanging a code", async () => {
    const exchangeCode = vi.fn();
    const response = await createGoogleCallbackGet({ env: configuredEnv, exchangeCode })(new Request(
      "https://blindly.example/api/auth/google/callback?code=abc&state=wrong-state",
      { headers: { cookie: callbackCookies } },
    ));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")).pathname).toBe("/login");
    expect(exchangeCode).not.toHaveBeenCalled();
  });

  it("clears OAuth cookies instead of crashing on malformed cookie segments", async () => {
    const response = await createGoogleCallbackGet({ env: configuredEnv })(new Request(
      "https://blindly.example/api/auth/google/callback?code=abc&state=state",
      { headers: { cookie: "missing-equals; blindly_oauth_state=%E0%A4%A; blindly_oauth_verifier=verifier" } },
    ));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")).pathname).toBe("/login");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

describe("Google account resolution", () => {
  it("never creates or elevates an account from the creator portal", async () => {
    const user = { findUnique: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]), create: vi.fn() };
    const database = { $transaction: vi.fn((callback) => callback({ user })) };
    await expect(resolveGoogleUser({
      database,
      profile: { subject: "sub-1", email: "creator@example.test", name: "Creator" },
      intentRole: "CREATOR",
    })).rejects.toThrow("Creator account not found");
    expect(user.create).not.toHaveBeenCalled();
  });

  it("retries with a collision-resistant handle when the first generated handle is already used", async () => {
    const collision = Object.assign(new Error("Unique constraint"), { code: "P2002", meta: { target: ["handle"] } });
    const created = { id: "user-1", role: "USER" };
    const user = {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockRejectedValueOnce(collision).mockResolvedValueOnce(created),
    };
    const database = { $transaction: vi.fn((callback) => callback({ user })) };
    const result = await resolveGoogleUser({
      database,
      profile: { subject: "sub-1", email: "fan@example.test", name: "Fan" },
      intentRole: "USER",
    });
    expect(result).toBe(created);
    expect(database.$transaction).toHaveBeenCalledTimes(2);
    expect(user.create).toHaveBeenCalledTimes(2);
    expect(user.create.mock.calls[1][0].data.handle).not.toBe(user.create.mock.calls[0][0].data.handle);
  });

  it("rejects ambiguous case-insensitive legacy email matches", async () => {
    const user = {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([
        { id: "user-1", email: "Fan@example.test", role: "USER", googleSubject: null },
        { id: "user-2", email: "fan@example.test", role: "USER", googleSubject: null },
      ]),
      updateMany: vi.fn(),
      create: vi.fn(),
    };
    const database = { $transaction: (callback) => callback({ user }) };
    await expect(resolveGoogleUser({
      database,
      profile: { subject: "sub-1", email: "fan@example.test", name: "Fan" },
      intentRole: "USER",
    })).rejects.toThrow("ambiguous");
    expect(user.updateMany).not.toHaveBeenCalled();
    expect(user.create).not.toHaveBeenCalled();
  });

  it("accepts a concurrent link only when the same user now owns the same subject", async () => {
    const existing = { id: "user-1", email: "fan@example.test", role: "USER", googleSubject: null, deletedAt: null, banned: false };
    const linked = { ...existing, googleSubject: "sub-1" };
    const user = {
      findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(linked),
      findMany: vi.fn().mockResolvedValue([existing]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    };
    const database = { $transaction: (callback) => callback({ user }) };
    await expect(resolveGoogleUser({
      database,
      profile: { subject: "sub-1", email: "fan@example.test", name: "Fan" },
      intentRole: "USER",
    })).resolves.toEqual(linked);
  });
});
