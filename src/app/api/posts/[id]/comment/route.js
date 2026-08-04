import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { createComment } from "@/lib/consumer/social";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createCommentsGet(database = db) {
  return async (_req, { params }) => {
    try {
      const { id } = await params;
      const post = await database.post.findFirst({
        where: {
          id,
          deletedAt: null,
          creator: { is: { deletedAt: null } },
        },
        select: { id: true },
      });
      if (!post) throw new Error("Post not found");

      const comments = await database.comment.findMany({
        where: { postId: id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              verified: true,
            },
          },
        },
      });
      return NextResponse.json(comments);
    } catch (error) {
      return consumerErrorResponse(error, "Failed to fetch comments");
    }
  };
}

export function createCommentPost({
  database = db,
  createComment: addComment = createComment,
} = {}) {
  return async (req, { user, params }) => {
    try {
      const { id } = await params;
      const result = await addComment(database, user, id, await req.json());
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to add comment");
    }
  };
}

export const GET = withAuth(createCommentsGet());
export const POST = withAuth(createCommentPost());
