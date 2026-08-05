import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";

export function createRewardPost() {
  return async () =>
    NextResponse.json(
      { error: "This feature is not available yet" },
      { status: 501 },
    );
}

export const POST = withAuth(createRewardPost());
