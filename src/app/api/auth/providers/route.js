import { NextResponse } from "next/server";
import { getAuthProviderStatus } from "@/lib/auth-providers";

export function createProvidersGet({ env = process.env } = {}) {
  return async function getProviders() {
    return NextResponse.json(getAuthProviderStatus(env), { headers: { "cache-control": "no-store" } });
  };
}

export const GET = createProvidersGet();
