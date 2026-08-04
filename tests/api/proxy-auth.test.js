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

const redirectLocation = (response) => new URL(response.headers.get("location"));

describe("actual consumer auth boundaries", () => {
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

  it("routes authenticated users and creators away from the legacy root", async () => {
    const userResponse = await proxy(request("/", signAccessToken("user-1", "USER")));
    const creatorResponse = await proxy(
      request("/", signAccessToken("creator-1", "CREATOR")),
    );

    expect(redirectLocation(userResponse).pathname).toBe("/feed");
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
