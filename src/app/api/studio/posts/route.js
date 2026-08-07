import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCreatorAuth } from "@/lib/middleware";
import { createPostSchema, validateBody } from "@/lib/validators";

export function createStudioPostsGet(database = db) {
  return async (_req, { user: creator }) => {
    try {
      const posts = await database.post.findMany({
        where: { creatorId: creator.id, deletedAt: null },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 100,
        select: {
          id: true,
          content: true,
          category: true,
          mediaUrl: true,
          mediaType: true,
          thumbnailUrl: true,
          isPremium: true,
          price: true,
          likesCount: true,
          commentsCount: true,
          viewsCount: true,
          sharesCount: true,
          scheduledAt: true,
          publishedAt: true,
          createdAt: true,
        },
      });
      return NextResponse.json({ items: posts });
    } catch (error) {
      console.error("GET Creator Posts Error:", error);
      return NextResponse.json({ error: "Failed to load creator content" }, { status: 500 });
    }
  };
}

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
          read: false,
          actionUrl: `/post/${post.id}`,
          metadata: JSON.stringify({ postId: post.id })
        }))
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST Creator Post Error:", error);
    return NextResponse.json({ error: "Failed to upload post" }, { status: 500 });
  }
});

export const GET = withCreatorAuth(createStudioPostsGet());
