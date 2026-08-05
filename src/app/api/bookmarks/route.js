import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { presentPost } from "@/lib/consumer/presenters";
import { consumerErrorResponse } from "@/lib/consumer/http";

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

export function createBookmarksGet({ database = db } = {}) {
  return async (_req, { user }) => {
    try {
      const rows = await database.bookmark.findMany({
        where: { userId: user.id, post: { deletedAt: null } },
        orderBy: { createdAt: "desc" },
        include: { post: { include: postInclude(user.id) } },
        take: 50,
      });

      return NextResponse.json({
        items: rows.map((bookmark) =>
          presentPost(
            {
              ...bookmark.post,
              creatorFollowers: bookmark.post.creator?.followers ?? [],
            },
            user.id,
          ),
        ),
      });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load saved posts");
    }
  };
}

export const GET = withAuth(createBookmarksGet());
