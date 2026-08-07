import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleSchema } from "@/lib/validators";
import {
  buildGoogleAuthorizationUrl,
  getAuthProviderStatus,
  oauthCookieOptions,
  oauthIntent,
  OAUTH_COOKIE_NAMES,
  randomUrlToken,
} from "@/lib/auth-providers";

export function createGoogleStartGet({ env = process.env, randomToken = randomUrlToken, database = db } = {}) {
  return async function startGoogle(request) {
    if (!getAuthProviderStatus(env).google) {
      return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
    }
    const { role, redirect, handle, registration } = oauthIntent(request.url);
    let requestedHandle = null;
    if (registration) {
      const parsedHandle = handleSchema.safeParse(handle);
      if (!parsedHandle.success) {
        return NextResponse.redirect(new URL(`/register?role=${role}&error=invalid_handle`, request.url));
      }
      const existing = await database.user.findFirst({
        where: { handle: { equals: parsedHandle.data, mode: "insensitive" } },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.redirect(new URL(`/register?role=${role}&error=handle_unavailable`, request.url));
      }
      requestedHandle = parsedHandle.data;
    }
    const state = randomToken();
    const verifier = randomToken();
    const response = NextResponse.redirect(buildGoogleAuthorizationUrl({ env, state, verifier }));
    const options = oauthCookieOptions(env);
    response.cookies.set(OAUTH_COOKIE_NAMES.state, state, options);
    response.cookies.set(OAUTH_COOKIE_NAMES.verifier, verifier, options);
    response.cookies.set(OAUTH_COOKIE_NAMES.redirect, redirect, options);
    response.cookies.set(OAUTH_COOKIE_NAMES.role, role, options);
    if (requestedHandle) response.cookies.set(OAUTH_COOKIE_NAMES.handle, requestedHandle, options);
    return response;
  };
}

export const GET = createGoogleStartGet();
