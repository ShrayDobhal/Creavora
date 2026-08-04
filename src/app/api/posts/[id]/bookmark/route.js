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

    const existingBookmark = await db.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id
        }
      }
    });

    let isBookmarked = false;
    if (existingBookmark) {
      await db.bookmark.delete({
        where: { id: existingBookmark.id }
      });
    } else {
      await db.bookmark.create({
        data: {
          userId: user.id,
          postId: post.id
        }
      });
      isBookmarked = true;
    }

    return NextResponse.json({ success: true, isBookmarked });
  } catch (error) {
    console.error("POST Bookmark Error:", error);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
});
