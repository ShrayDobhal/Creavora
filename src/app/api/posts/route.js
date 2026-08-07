import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { socialPostCreateSchema, validateBody } from "@/lib/validators";
import { getFeedPage, parseFeedQuery } from "@/lib/consumer/feed";
import { consumerErrorResponse } from "@/lib/consumer/http";
import { presentPost } from "@/lib/consumer/presenters";

const createPostFromVerifiedMedia = async (database, user, data) => {
  const now = new Date();
  const rows = await database.$queryRaw`
    WITH verified_asset AS (
      SELECT "publicUrl", "mimeType"
      FROM "MediaAsset"
      WHERE "id" = ${data.mediaAssetId}
        AND "ownerId" = ${user.id}
        AND "kind" = 'post'
        AND "mimeType" IN ('image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime')
        AND "deletedAt" IS NULL
        AND "verifiedAt" IS NOT NULL
      FOR SHARE
    )
    INSERT INTO "Post" (
      "id", "creatorId", "content", "category", "mediaUrl", "mediaType", "isPremium", "price",
      "publishedAt", "createdAt", "updatedAt"
    )
    SELECT
      ${randomUUID()}, ${user.id}, ${data.content}, ${data.category}, "publicUrl", "mimeType", FALSE, 0,
      ${now}, ${now}, ${now}
    FROM verified_asset
    RETURNING *
  `;
  return rows[0] ?? null;
};

export function createPostsGet({
  database = db,
  getFeedPage: loadFeedPage = getFeedPage,
  parseFeedQuery: parseQuery = parseFeedQuery,
} = {}) {
  return async (req, { user }) => {
    try {
      const query = parseQuery(new URL(req.url).searchParams);
      return NextResponse.json(await loadFeedPage(database, user.id, query));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load feed");
    }
  };
}

export function createPostPost({ database = db, logError = console.error } = {}) {
  return async (req, { user }) => {
    try {
      const body = await req.json();
      const { error, data } = validateBody(socialPostCreateSchema, body);

      if (error) {
        return NextResponse.json(
          { error: "Validation failed", details: error },
          { status: 400 },
        );
      }

      let post;
      if (data.mediaAssetId) {
        post = await createPostFromVerifiedMedia(database, user, data);
        if (!post) {
          return NextResponse.json({ error: "Invalid post media" }, { status: 400 });
        }
      } else {
        post = await database.post.create({
          data: {
            creatorId: user.id,
            content: data.content,
            category: data.category,
            mediaUrl: null,
            mediaType: null,
            isPremium: false,
            price: 0,
            publishedAt: new Date(),
          },
        });
      }

      try {
        const follows = await database.follow.findMany({
          where: { followingId: user.id },
          select: { followerId: true },
        });
        if (follows.length > 0) {
          await database.notification.createMany({
            data: follows.map((follow) => ({
              userId: follow.followerId,
              title: `New post by ${user.name}`,
              message: `${user.name} shared a new post`,
              type: "SYSTEM",
              read: false,
              actionUrl: `/post/${post.id}`,
              metadata: JSON.stringify({ postId: post.id }),
            })),
          });
        }
      } catch (notificationError) {
        logError("Post created but follower notification delivery failed", {
          creatorId: user.id,
          postId: post.id,
          message: notificationError?.message || "Unknown notification error",
        });
      }

      return NextResponse.json(
        presentPost({
          ...post,
          creator: { ...user, followers: [], _count: { followers: 0 } },
          likes: [],
          bookmarks: [],
          creatorFollowers: [],
        }, user.id),
        { status: 201 },
      );
    } catch (error) {
      return consumerErrorResponse(error, "Failed to upload post");
    }
  };
}

export const GET = withAuth(createPostsGet());
export const POST = withAuth(createPostPost());
