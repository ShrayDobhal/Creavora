import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

export const POST = withAuth(async (req, { user, params }) => {
  try {
    const { handle } = await params;

    const targetCreator = await db.user.findUnique({
      where: { handle, role: "CREATOR", deletedAt: null }
    });

    if (!targetCreator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetCreator.id
        }
      }
    });

    let isFollowing = false;
    if (existingFollow) {
      await db.follow.delete({
        where: { id: existingFollow.id }
      });
    } else {
      await db.follow.create({
        data: {
          followerId: user.id,
          followingId: targetCreator.id
        }
      });
      isFollowing = true;

      // Notify creator
      await db.notification.create({
        data: {
          userId: targetCreator.id,
          title: "New Follower! 👤",
          message: `${user.name} started following you.`,
          type: "FOLLOW",
          read: false
        }
      });
    }

    return NextResponse.json({ success: true, isFollowing });
  } catch (error) {
    console.error("POST Follow Creator Error:", error);
    return NextResponse.json({ error: "Failed to follow creator" }, { status: 500 });
  }
});
