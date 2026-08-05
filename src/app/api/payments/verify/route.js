import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";

export const POST = withAuth(async () =>
  NextResponse.json(
    { error: "This feature is not available yet" },
    { status: 501 },
  ),
);
