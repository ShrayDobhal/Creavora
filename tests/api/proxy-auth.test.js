import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({ db: {} }));

import { proxy } from "@/../src/proxy";
import { authenticate } from "@/lib/middleware";
import { signAccessToken } from "@/lib/auth";

const ACCESS_SECRET = "creavora-access-secret-dev-only";

const request = (pathname, token) =>
  new NextRequest(`http://localhost${pathname}`, {
    headers: token ? { cookie: `access_token=${token}` } : undefined,
  });

const requestWithRefresh = (pathname, refreshToken = "remembered-session") =>
  new NextRequest(`http://localhost${pathname}`, {
    headers: { cookie: `refresh_token=${refreshToken}` },
  });

const redirectLocation = (response) => new URL(response.headers.get("location"));

describe("actual consumer auth boundaries", () => {
  it("allows only the exact recovery and OAuth public surfaces anonymously", async () => {
    const publicPaths = [
      "/forgot-password",
      "/reset-password",
      "/api/auth/providers",
      "/api/auth/google/start",
      "/api/auth/google/callback",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
    ];
    for (const pathname of publicPaths) {
      expect((await proxy(request(pathname))).status, pathname).toBe(200);
    }
    expect((await proxy(request("/api/auth/google/private"))).status).toBe(401);
    expect((await proxy(request("/api/auth/reset-password/private"))).status).toBe(401);
  });

  it("allows verified database media to render without an auth token", async () => {
    const response = await proxy(request("/api/media/9cd87ddd-5890-467d-8feb-17c83f432111"));
    expect(response.status).toBe(200);
  });

  it("redirects an unauthenticated root request to the public landing page", async () => {
    const response = await proxy(request("/"));

    expect(response.status).toBe(307);
    expect(redirectLocation(response).pathname).toBe("/landing");
  });

  it("redirects an expired root token to login with the root return path", async () => {
    const expiredToken = jwt.sign(
      { sub: "expired-user", role: "USER", exp: Math.floor(Date.now() / 1000) - 60 },
      ACCESS_SECRET,
    );

    const response = await proxy(request("/", expiredToken));

    expect(response.status).toBe(307);
    expect(redirectLocation(response).pathname).toBe("/login");
    expect(redirectLocation(response).searchParams.get("redirect")).toBe("/");
  });

  it("renews a remembered browser session before sending the user to login", async () => {
    const response = await proxy(requestWithRefresh("/home?tab=following"));

    expect(response.status).toBe(307);
    expect(redirectLocation(response).pathname).toBe("/api/auth/refresh");
    expect(redirectLocation(response).searchParams.get("redirect")).toBe("/home?tab=following");
  });

  it("routes every authenticated role from root to its approved workspace", async () => {
    const userResponse = await proxy(request("/", signAccessToken("user-1", "USER")));
    const fanResponse = await proxy(request("/", signAccessToken("fan-1", "FAN")));
    const creatorResponse = await proxy(
      request("/", signAccessToken("creator-1", "CREATOR")),
    );
    const adminResponse = await proxy(request("/", signAccessToken("admin-1", "ADMIN")));

    expect(redirectLocation(userResponse).pathname).toBe("/home");
    expect(redirectLocation(fanResponse).pathname).toBe("/home");
    expect(redirectLocation(creatorResponse).pathname).toBe("/studio/content");
    expect(redirectLocation(adminResponse).pathname).toBe("/admin");
  });

  it("keeps Home private and redirects creators to their own workspace", async () => {
    const anonymousResponse = await proxy(request("/home"));
    const userResponse = await proxy(request("/home", signAccessToken("user-1", "USER")));
    const fanResponse = await proxy(request("/home", signAccessToken("fan-1", "FAN")));
    const creatorResponse = await proxy(
      request("/home", signAccessToken("creator-1", "CREATOR")),
    );

    expect(redirectLocation(anonymousResponse).pathname).toBe("/login");
    expect(redirectLocation(anonymousResponse).searchParams.get("redirect")).toBe("/home");
    expect(userResponse.status).toBe(200);
    expect(fanResponse.status).toBe(200);
    expect(redirectLocation(creatorResponse).pathname).toBe("/studio/content");
  });

  it("enforces creator and consumer route roles with verified tokens", async () => {
    const userResponse = await proxy(
      request("/studio/content", signAccessToken("user-1", "USER")),
    );
    const creatorResponse = await proxy(
      request("/feed", signAccessToken("creator-1", "CREATOR")),
    );

    expect(redirectLocation(userResponse).pathname).toBe("/feed");
    expect(redirectLocation(creatorResponse).pathname).toBe("/studio/content");
  });

  it("uses the real middleware to reject missing and expired API credentials", async () => {
    const missing = await authenticate(new Request("http://localhost/api/posts"));
    const expiredToken = jwt.sign(
      { sub: "expired-user", role: "USER", exp: Math.floor(Date.now() / 1000) - 60 },
      ACCESS_SECRET,
    );
    const expired = await authenticate(
      new Request("http://localhost/api/posts", {
        headers: { authorization: `Bearer ${expiredToken}` },
      }),
    );

    expect(missing.error.status).toBe(401);
    expect(await missing.error.json()).toEqual({ error: "Authentication required" });
    expect(expired.error.status).toBe(401);
    expect(await expired.error.json()).toEqual({ error: "Invalid or expired token" });
  });
});
