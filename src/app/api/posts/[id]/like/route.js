import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

export const POST = withAuth(async (req, { user, params }) => {
  try {
    const { id: postId } = await params;

    const post = await db.post.findUnique({
      where: { id: postId, deletedAt: null }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already liked the post
    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id
        }
      }
    });

    let isLiked = false;
    await db.$transaction(async (tx) => {
      if (existingLike) {
        await tx.like.delete({
          where: { id: existingLike.id }
        });
        await tx.post.update({
          where: { id: post.id },
          data: { likesCount: { decrement: 1 } }
        });
      } else {
        await tx.like.create({
          data: {
            userId: user.id,
            postId: post.id
          }
        });
        await tx.post.update({
          where: { id: post.id },
          data: { likesCount: { increment: 1 } }
        });
        isLiked = true;

        // Notify post creator
        if (post.creatorId !== user.id) {
          await tx.notification.create({
            data: {
              userId: post.creatorId,
              title: "New Like! ❤️",
              message: `${user.name} liked your post.`,
              type: "LIKE",
              read: false
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true, isLiked });
  } catch (error) {
    console.error("POST Like Error:", error);
    return NextResponse.json({ error: "Failed to toggle like status" }, { status: 500 });
  }
});
