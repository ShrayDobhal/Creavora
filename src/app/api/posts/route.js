import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth, withCreatorAuth } from "@/lib/middleware";
import { createPostSchema, validateBody } from "@/lib/validators";
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
  return async (req, { user: creator }) => {
    try {
      const body = await req.json();
      const { error, data } = validateBody(createPostSchema, body);

      if (error) {
        return NextResponse.json(
          { error: "Validation failed", details: error },
          { status: 400 },
        );
      }

      const post = await database.post.create({
        data: {
          creatorId: creator.id,
          content: data.content,
          mediaUrl: data.mediaUrl || null,
          mediaType: data.mediaType || null,
          isPremium: data.isPremium || false,
          price: 0,
          publishedAt: new Date(),
        },
      });

      try {
        const follows = await database.follow.findMany({
          where: { followingId: creator.id },
          select: { followerId: true },
        });
        if (follows.length > 0) {
          await database.notification.createMany({
            data: follows.map((follow) => ({
              userId: follow.followerId,
              title: `New Post by ${creator.name}`,
              message: data.isPremium
                ? `${creator.name} published work marked for future premium access.`
                : `${creator.name} published: "${data.content.substring(0, 30)}..."`,
              type: "SYSTEM",
              read: false,
            })),
          });
        }
      } catch (notificationError) {
        logError("Post created but follower notification delivery failed", {
          creatorId: creator.id,
          postId: post.id,
          message: notificationError?.message || "Unknown notification error",
        });
      }

      return NextResponse.json(post);
    } catch (error) {
      return consumerErrorResponse(error, "Failed to upload post");
    }
  };
}

export const GET = withAuth(createPostsGet());
export const POST = withCreatorAuth(createPostPost());
