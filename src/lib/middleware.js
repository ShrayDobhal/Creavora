import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeRole, verifyAccessToken, extractTokenFromRequest } from "@/lib/auth";

/**
 * Authenticate a request and return the full user object.
 * Works with both cookie-based (web) and Bearer token (mobile) auth.
 *
 * @param {Request} req
 * @returns {Promise<{user: object} | {error: NextResponse}>}
 */
export async function authenticate(req) {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const payload = verifyAccessToken(token);
  if (!payload || !payload.sub) {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  const user = await db.user.findFirst({
    where: { id: payload.sub, deletedAt: null },
  });

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      ),
    };
  }

  return { user: { ...user, role: normalizeRole(user.role) } };
}

/**
 * Require a specific role. Returns an error response if the user
 * doesn't have the required role.
 *
 * @param {object} user - User object from authenticate()
 * @param {string|string[]} roles - Required role(s)
 * @returns {NextResponse|null} Error response or null if authorized
 */
export function requireRole(user, roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Higher-order wrapper for protected API route handlers.
 * Automatically authenticates and optionally checks roles.
 *
 * Usage:
 *   export const GET = withAuth(async (req, { user }) => { ... });
 *   export const POST = withAuth(async (req, { user }) => { ... }, { roles: ["CREATOR"] });
 *
 * @param {Function} handler - Route handler (req, { user }) => NextResponse
 * @param {object} options - { roles?: string[] }
 */
export function withAuth(handler, options = {}) {
  return async (req, context) => {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    if (options.roles) {
      const roleError = requireRole(auth.user, options.roles);
      if (roleError) return roleError;
    }

    return handler(req, { user: auth.user, ...context });
  };
}

/**
 * Wrapper specifically for creator-only routes.
 */
export function withCreatorAuth(handler) {
  return withAuth(handler, { roles: ["CREATOR", "ADMIN"] });
}

/**
 * Wrapper specifically for admin-only routes.
 */
export function withAdminAuth(handler) {
  return withAuth(handler, { roles: ["ADMIN"] });
}
