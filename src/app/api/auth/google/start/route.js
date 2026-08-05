import { NextResponse } from "next/server";
import {
  buildGoogleAuthorizationUrl,
  getAuthProviderStatus,
  oauthCookieOptions,
  oauthIntent,
  OAUTH_COOKIE_NAMES,
  randomUrlToken,
} from "@/lib/auth-providers";

export function createGoogleStartGet({ env = process.env, randomToken = randomUrlToken } = {}) {
  return async function startGoogle(request) {
    if (!getAuthProviderStatus(env).google) {
      return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
    }
    const { role, redirect } = oauthIntent(request.url);
    const state = randomToken();
    const verifier = randomToken();
    const response = NextResponse.redirect(buildGoogleAuthorizationUrl({ env, state, verifier }));
    const options = oauthCookieOptions(env);
    response.cookies.set(OAUTH_COOKIE_NAMES.state, state, options);
    response.cookies.set(OAUTH_COOKIE_NAMES.verifier, verifier, options);
    response.cookies.set(OAUTH_COOKIE_NAMES.redirect, redirect, options);
    response.cookies.set(OAUTH_COOKIE_NAMES.role, role, options);
    return response;
  };
}

export const GET = createGoogleStartGet();
