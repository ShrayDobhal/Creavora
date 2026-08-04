import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { toggleBookmark } from "@/lib/consumer/social";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createBookmarkPost({
  database = db,
  toggleBookmark: toggle = toggleBookmark,
} = {}) {
  return async (_req, { user, params }) => {
    try {
      const { id } = await params;
      return NextResponse.json(await toggle(database, user.id, id));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to toggle bookmark");
    }
  };
}

export const POST = withAuth(createBookmarkPost());
