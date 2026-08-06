import { NextResponse } from "next/server";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "creavora-access-secret-dev-only");

const PUBLIC_ROUTES = [
  "/landing",
  "/api/media",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
];
const EXACT_PUBLIC_ROUTES = new Set([
  "/forgot-password",
  "/reset-password",
  "/api/auth/providers",
  "/api/auth/google/start",
  "/api/auth/google/callback",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
]);
const AUTH_ENTRY_ROUTES = ["/login", "/creator-login", "/register"];
const CREATOR_ROUTES = ["/studio"];
const CREATOR_API_ROUTES = ["/api/studio"];
const USER_ROUTES = [
  "/home",
  "/feed",
  "/explore",
  "/live",
  "/subscriptions",
  "/messages",
  "/notifications",
  "/collections",
  "/wallet",
  "/rewards",
  "/saved",
  "/settings",
  "/profile",
  "/checkout",
];
const ADMIN_ROUTES = ["/admin"];
const ADMIN_API_ROUTES = ["/api/admin"];

const matchesRoute = (pathname, route) =>
  pathname === route || pathname.startsWith(`${route}/`);

const loginRedirect = (req, pathname) => {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
};

const refreshRedirect = (req, destination) => {
  const refreshUrl = new URL("/api/auth/refresh", req.url);
  refreshUrl.searchParams.set("redirect", destination);
  return NextResponse.redirect(refreshUrl);
};

const roleHome = (role) => {
  if (role === "CREATOR") return "/studio/content";
  if (role === "ADMIN") return "/admin";
  if (role === "USER" || role === "FAN") return "/home";
  return null;
};

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
      ["verify"],
    );
    const signature = Uint8Array.from(
      atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")),
      (character) => character.charCodeAt(0),
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    return valid ? payload : null;
  } catch {
    return null;
  }
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const requestedPath = `${pathname}${req.nextUrl.search}`;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isAuthEntry = AUTH_ENTRY_ROUTES.some((route) => matchesRoute(pathname, route));
  if (EXACT_PUBLIC_ROUTES.has(pathname)) return NextResponse.next();
  if (!isAuthEntry && PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route))) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = accessToken || bearerToken;

  if (pathname === "/") {
    if (!token) {
      return refreshToken
        ? refreshRedirect(req, "/")
        : NextResponse.redirect(new URL("/landing", req.url));
    }
    const payload = await verifyJwtPayload(token);
    if (!payload) return refreshToken ? refreshRedirect(req, "/") : loginRedirect(req, pathname);
    const destination = roleHome(payload.role);
    return destination
      ? NextResponse.redirect(new URL(destination, req.url))
      : loginRedirect(req, pathname);
  }

  if (isAuthEntry) {
    if (!token) return refreshToken ? refreshRedirect(req, "/") : NextResponse.next();
    const payload = await verifyJwtPayload(token);
    const destination = payload ? roleHome(payload.role) : null;
    return destination
      ? NextResponse.redirect(new URL(destination, req.url))
      : NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return refreshToken ? refreshRedirect(req, requestedPath) : loginRedirect(req, requestedPath);
  }

  const payload = await verifyJwtPayload(token);
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    return refreshToken ? refreshRedirect(req, requestedPath) : loginRedirect(req, requestedPath);
  }

  const role = payload.role;
  if (role === "CREATOR" && USER_ROUTES.some((route) => matchesRoute(pathname, route))) {
    return NextResponse.redirect(new URL("/studio/content", req.url));
  }

  if (
    CREATOR_ROUTES.some((route) => matchesRoute(pathname, route)) ||
    CREATOR_API_ROUTES.some((route) => matchesRoute(pathname, route))
  ) {
    if (role !== "CREATOR" && role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/feed", req.url));
    }
  }

  if (
    ADMIN_ROUTES.some((route) => matchesRoute(pathname, route)) ||
    ADMIN_API_ROUTES.some((route) => matchesRoute(pathname, route))
  ) {
    if (role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL(roleHome(role) || "/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
