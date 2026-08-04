import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { createCommentSchema, validateBody } from "@/lib/validators";

// GET comments for a post
export const GET = withAuth(async (req, { params }) => {
  try {
    const { id: postId } = await params;
    const comments = await db.comment.findMany({
      where: { postId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            verified: true
          }
        }
      }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET Comments Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
});

// POST add a comment to a post
export const POST = withAuth(async (req, { user, params }) => {
  try {
    const { id: postId } = await params;
    const body = await req.json();
    const { error, data } = validateBody(createCommentSchema, body);

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    const post = await db.post.findUnique({
      where: { id: postId, deletedAt: null }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await db.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          userId: user.id,
          postId: post.id,
          content: data.content,
          parentId: data.parentId || null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              verified: true
            }
          }
        }
      });

      await tx.post.update({
        where: { id: post.id },
        data: { commentsCount: { increment: 1 } }
      });

      // Notify post creator
      if (post.creatorId !== user.id) {
        await tx.notification.create({
          data: {
            userId: post.creatorId,
            title: "New Comment! 💬",
            message: `${user.name} commented: "${data.content.substring(0, 30)}..."`,
            type: "COMMENT",
            read: false
          }
        });
      }

      return newComment;
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("POST Comment Error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
});
