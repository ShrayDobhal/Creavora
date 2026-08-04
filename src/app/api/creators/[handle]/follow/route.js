import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { toggleFollow } from "@/lib/consumer/social";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createFollowPost({
  database = db,
  toggleFollow: toggle = toggleFollow,
} = {}) {
  return async (_req, { user, params }) => {
    try {
      const { handle } = await params;
      return NextResponse.json(await toggle(database, user, handle));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to toggle follow");
    }
  };
}

export const POST = withAuth(createFollowPost());
