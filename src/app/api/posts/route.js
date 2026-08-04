import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth, withCreatorAuth } from "@/lib/middleware";
import { createPostSchema, validateBody } from "@/lib/validators";

// GET feed posts with cursor pagination and premium protection
// Query params: cursor (date string or id), limit, type ("trending", "latest", "following", "recommended")
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const type = searchParams.get("type") || "latest";

    let whereClause = { deletedAt: null, publishedAt: { lte: new Date() } };

    // Implement filters based on feed type
    if (type === "following") {
      const following = await db.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true }
      });
      const creatorIds = following.map(f => f.followingId);
      whereClause.creatorId = { in: creatorIds };
    }

    // Cursor pagination settings
    let queryOptions = {
      where: whereClause,
      take: limit + 1, // Fetch one extra to determine next cursor
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            roleTitle: true,
            verified: true
          }
        },
        likes: {
          where: { userId: user.id }
        },
        bookmarks: {
          where: { userId: user.id }
        }
      }
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const posts = await db.post.findMany(queryOptions);

    let nextCursor = null;
    let paginatedPosts = posts;
    if (posts.length > limit) {
      nextCursor = posts[limit].id;
      paginatedPosts = posts.slice(0, limit);
    }

    // Add subscription validation metadata for premium posts
    const activeSubs = await db.subscription.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { creatorId: true }
    });
    const subbedCreatorIds = new Set(activeSubs.map(s => s.creatorId));

    const formattedPosts = paginatedPosts.map(post => {
      const isSubbed = subbedCreatorIds.has(post.creatorId) || post.creatorId === user.id;
      const isLocked = post.isPremium && !isSubbed;

      return {
        id: post.id,
        content: isLocked ? "🔒 Premium Content Locked. Subscribe to unlock." : post.content,
        mediaUrl: isLocked ? null : post.mediaUrl,
        mediaType: isLocked ? null : post.mediaType,
        isPremium: post.isPremium,
        price: post.price,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        viewsCount: post.viewsCount,
        createdAt: post.createdAt,
        creator: post.creator,
        isLiked: post.likes.length > 0,
        isBookmarked: post.bookmarks.length > 0,
        isLocked
      };
    });

    return NextResponse.json({
      posts: formattedPosts,
      nextCursor
    });
  } catch (error) {
    console.error("GET Feed Posts Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

// POST create creator post
export const POST = withCreatorAuth(async (req, { user: creator }) => {
  try {
    const body = await req.json();
    const { error, data } = validateBody(createPostSchema, body);

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    const postPrice = data.isPremium ? data.price : 0.0;

    const post = await db.post.create({
      data: {
        creatorId: creator.id,
        content: data.content,
        mediaUrl: data.mediaUrl || null,
        mediaType: data.mediaType || null,
        isPremium: data.isPremium || false,
        price: postPrice,
        publishedAt: new Date()
      }
    });

    // Notify all followers
    const follows = await db.follow.findMany({
      where: { followingId: creator.id },
      select: { followerId: true }
    });

    if (follows.length > 0) {
      await db.notification.createMany({
        data: follows.map(f => ({
          userId: f.followerId,
          title: `New Post by ${creator.name}!`,
          message: data.isPremium
            ? `${creator.name} just posted a new premium locked post for ₹${postPrice.toFixed(0)}!`
            : `${creator.name} uploaded a new post: "${data.content.substring(0, 30)}..."`,
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
