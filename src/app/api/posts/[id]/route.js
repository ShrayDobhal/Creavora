import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { socialPostUpdateSchema, validateBody } from "@/lib/validators";
import { consumerErrorResponse } from "@/lib/consumer/http";
import { presentPost } from "@/lib/consumer/presenters";
import { resolvePremiumAvailability } from "@/lib/consumer/premium";

const postInclude = (viewerId) => ({
  creator: {
    include: {
      creatorProfile: true,
      followers: { where: { followerId: viewerId } },
      _count: { select: { followers: true } },
    },
  },
  likes: { where: { userId: viewerId } },
  bookmarks: { where: { userId: viewerId } },
});

export function createPostGet(database = db) {
  return async (_req, { user, params }) => {
    try {
      const { id } = await params;
      const post = await database.post.findFirst({
        where: { id, deletedAt: null, creator: { is: { deletedAt: null, banned: false } } },
        include: postInclude(user.id),
      });
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      const premiumAccess = await resolvePremiumAvailability(database, user.id, [post]);
      return NextResponse.json(
        presentPost(
          { ...post, creatorFollowers: post.creator.followers },
          user.id,
          premiumAccess.get(post.id),
        ),
      );
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load post");
    }
  };
}

const ownedPostWhere = (id, userId) => ({
  id,
  creatorId: userId,
  deletedAt: null,
});

const mutationMissResponse = async (post, id) => {
  const existing = await post.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  return existing
    ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
    : NextResponse.json({ error: "Post not found" }, { status: 404 });
};

export function createPostPatch({ database = db, post = database.post } = {}) {
  return async (req, { user, params }) => {
    try {
      const { id } = await params;
      const { error, data } = validateBody(socialPostUpdateSchema, await req.json());
      if (error) {
        return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
      }

      const result = await post.updateMany({
        where: ownedPostWhere(id, user.id),
        data: { content: data.content },
      });
      if (result.count === 0) return mutationMissResponse(post, id);

      return NextResponse.json({ id, content: data.content });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to update post");
    }
  };
}

export function createPostDelete({ database = db, post = database.post } = {}) {
  return async (_req, { user, params }) => {
    try {
      const { id } = await params;
      const result = await post.updateMany({
        where: ownedPostWhere(id, user.id),
        data: { deletedAt: new Date() },
      });
      if (result.count === 0) return mutationMissResponse(post, id);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to delete post");
    }
  };
}

export const GET = withAuth(createPostGet());
export const PATCH = withAuth(createPostPatch());
export const DELETE = withAuth(createPostDelete());
