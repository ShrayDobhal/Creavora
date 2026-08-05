import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { socialPostCreateSchema, validateBody } from "@/lib/validators";
import { getFeedPage, parseFeedQuery } from "@/lib/consumer/feed";
import { consumerErrorResponse } from "@/lib/consumer/http";

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

      let media = null;
      if (data.mediaAssetId) {
        const asset = await database.mediaAsset.findFirst({
          where: {
            id: data.mediaAssetId,
            ownerId: user.id,
            kind: "post",
            mimeType: { in: ["image/jpeg", "image/png", "image/webp"] },
            deletedAt: null,
            verifiedAt: { not: null },
          },
          select: { publicUrl: true, mimeType: true },
        });
        if (!asset) {
          return NextResponse.json({ error: "Invalid post media" }, { status: 400 });
        }
        media = asset;
      }

      const post = await database.post.create({
        data: {
          creatorId: user.id,
          content: data.content,
          mediaUrl: media?.publicUrl || null,
          mediaType: media?.mimeType || null,
          isPremium: false,
          price: 0,
          publishedAt: new Date(),
        },
      });

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

      return NextResponse.json(post, { status: 201 });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to upload post");
    }
  };
}

export const GET = withAuth(createPostsGet());
export const POST = withAuth(createPostPost());
