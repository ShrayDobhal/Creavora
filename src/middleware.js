import { NextResponse } from "next/server";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "creavora-access-secret-dev-only";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
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

// Routes that require ADMIN role
const ADMIN_ROUTES = ["/admin"];
const ADMIN_API_ROUTES = ["/api/admin"];

/**
 * Decode JWT payload without verification (Edge Runtime doesn't support
 * the full jsonwebtoken library). The actual cryptographic verification
 * happens in the API route middleware. This edge middleware only does
 * a quick role check for routing purposes.
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req) {
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
    // No token — redirect to login for pages, 401 for APIs
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode the token to get the role
  const payload = decodeJwtPayload(token);
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
