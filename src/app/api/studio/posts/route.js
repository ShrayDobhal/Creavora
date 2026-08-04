import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCreatorAuth } from "@/lib/middleware";
import { createPostSchema, validateBody } from "@/lib/validators";

// POST create creator post
export const POST = withCreatorAuth(async (req, { user: creator }) => {
  try {
    const body = await req.json();
    const { error, data } = validateBody(createPostSchema, body);

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    if (data.mediaUrl) {
      const asset = await db.mediaAsset.findFirst({
        where: {
          ownerId: creator.id,
          publicUrl: data.mediaUrl,
          deletedAt: null,
          verifiedAt: { not: null },
        },
        select: { id: true },
      });
      if (!asset) {
        return NextResponse.json({ error: "Invalid post media" }, { status: 400 });
      }
    }

    const postPrice = data.isPremium ? data.price : 0.0;

    // Create the post in database
    const post = await db.post.create({
      data: {
        creatorId: creator.id,
        content: data.content,
        mediaUrl: data.mediaUrl || null,
        mediaType: data.mediaType || null,
        isPremium: data.isPremium || false,
        price: postPrice,
        likesCount: 0,
        commentsCount: 0
      }
    });

    // Notify all followers (formerly hardcoded to 'arjun')
    const follows = await db.follow.findMany({
      where: { followingId: creator.id },
      select: { followerId: true }
    });

    if (follows.length > 0) {
      await db.notification.createMany({
        data: follows.map(f => ({
          userId: f.followerId,
          title: `New Post by ${creator.name}!`,
          message: `${creator.name} uploaded a new post: "${data.content.substring(0, 30)}..."`,
          type: "SYSTEM",
          read: false
        }))
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST Creator Post Error:", error);
    return NextResponse.json({ error: "Failed to upload post" }, { status: 500 });
  }
});
