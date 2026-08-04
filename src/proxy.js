import { NextResponse } from "next/server";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === "production" ? undefined : "creavora-access-secret-dev-only");

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/landing",
  "/login",
  "/creator-login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
];

// Routes that require CREATOR role
const CREATOR_ROUTES = ["/studio"];
const CREATOR_API_ROUTES = ["/api/studio"];
const USER_ROUTES = ["/", "/feed", "/explore", "/live", "/subscriptions", "/messages", "/notifications", "/collections", "/wallet", "/rewards", "/saved", "/settings", "/profile", "/checkout"];

// Routes that require ADMIN role
const ADMIN_ROUTES = ["/admin"];
const ADMIN_API_ROUTES = ["/api/admin"];

/**
 * Verify the HS256 access token in the Edge Runtime before using its role.
 * Decoding an unverified JWT allows anyone to forge a role claim.
 */
async function verifyJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !ACCESS_SECRET) return null;
    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    if (header.alg !== "HS256") return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(ACCESS_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signature = Uint8Array.from(
      atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")),
      (character) => character.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Get access token from cookie
  const accessToken = req.cookies.get("access_token")?.value;

  // Also check Authorization header (for API clients)
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const token = accessToken || bearerToken;

  if (!token) {
    // If hitting the index page without auth, redirect to landing
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/landing", req.url));
    }
    // No token — redirect to login for pages, 401 for APIs
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode the token to get the role
  const payload = await verifyJwtPayload(token);
  if (!payload) {
    // Expired or malformed token
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = payload.role;

  if (role === "CREATOR" && USER_ROUTES.some((route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)))) {
    return NextResponse.redirect(new URL("/studio/content", req.url));
  }

  // Check creator-only routes
  if (
    CREATOR_ROUTES.some((r) => pathname.startsWith(r)) ||
    CREATOR_API_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    if (role !== "CREATOR" && role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Check admin-only routes
  if (
    ADMIN_ROUTES.some((r) => pathname.startsWith(r)) ||
    ADMIN_API_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    if (role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Authenticated users on login/register pages should be redirected
  if (pathname === "/login" || pathname === "/creator-login" || pathname === "/register") {
    if (role === "CREATOR") {
      return NextResponse.redirect(new URL("/studio/content", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
