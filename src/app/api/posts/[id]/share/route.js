import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createSharePost(database = db) {
  return async (_req, { params }) => {
    try {
      const { id } = await params;
      const updated = await database.post.updateMany({
        where: { id, deletedAt: null, creator: { is: { deletedAt: null, banned: false } } },
        data: { sharesCount: { increment: 1 } },
      });
      if (updated.count === 0) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      const post = await database.post.findUnique({ where: { id }, select: { sharesCount: true } });
      return NextResponse.json({ sharesCount: post.sharesCount });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to share post");
    }
  };
}

export const POST = withAuth(createSharePost());
