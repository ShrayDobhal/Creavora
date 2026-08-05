import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { createComment, deleteComment, updateComment } from "@/lib/consumer/social";
import { deleteCommentSchema, updateCommentSchema } from "@/lib/validators";
import { consumerErrorResponse } from "@/lib/consumer/http";
import { presentComment } from "@/lib/consumer/presenters";

export function createCommentsGet(database = db) {
  return async (_req, { user, params }) => {
    try {
      const { id } = await params;
      const post = await database.post.findFirst({
        where: {
          id,
          deletedAt: null,
          creator: { is: { deletedAt: null, banned: false } },
        },
        select: { id: true },
      });
      if (!post) throw new Error("Post not found");

      const comments = await database.comment.findMany({
        where: {
          postId: id,
          deletedAt: null,
          user: { is: { deletedAt: null, banned: false } },
        },
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
      return NextResponse.json(comments.map((comment) => presentComment(comment, user.id)));
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
      return NextResponse.json(
        { ...result, comment: presentComment(result.comment, user.id) },
        { status: 201 },
      );
    } catch (error) {
      return consumerErrorResponse(error, "Failed to add comment");
    }
  };
}


export function createCommentPatch({ database = db, editComment = updateComment } = {}) {
  return async (req, { user, params }) => {
    try {
      const { id } = await params;
      const input = updateCommentSchema.parse(await req.json());
      return NextResponse.json(presentComment(await editComment(database, user, id, input), user.id));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to update comment");
    }
  };
}

export function createCommentDelete({ database = db, removeComment = deleteComment } = {}) {
  return async (req, { user, params }) => {
    try {
      const { id } = await params;
      const input = deleteCommentSchema.parse(await req.json());
      return NextResponse.json(await removeComment(database, user, id, input.commentId));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to delete comment");
    }
  };
}

export const GET = withAuth(createCommentsGet());
export const POST = withAuth(createCommentPost());
export const PATCH = withAuth(createCommentPatch());
export const DELETE = withAuth(createCommentDelete());
