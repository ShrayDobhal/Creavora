import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { toggleLike } from "@/lib/consumer/social";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createLikePost({ database = db, toggleLike: toggle = toggleLike } = {}) {
  return async (_req, { user, params }) => {
    try {
      const { id } = await params;
      return NextResponse.json(await toggle(database, user, id));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to toggle like");
    }
  };
}

export const POST = withAuth(createLikePost());
