import { FEED_MODES } from "./constants";
import { presentPost } from "./presenters";
import { feedQuerySchema } from "../validators";

const encodeCursor = (post) =>
  Buffer.from(
    JSON.stringify({ publishedAt: post.publishedAt.toISOString(), id: post.id }),
  ).toString("base64url");

const decodeCursor = (cursor) => {
  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString());
    const publishedAt = new Date(value.publishedAt);

    if (!value.id || Number.isNaN(publishedAt.getTime())) throw new Error();
    return { publishedAt, id: value.id };
  } catch {
    throw new Error("Invalid feed cursor");
  }
};

export function parseFeedQuery(params) {
  const mode = params.get("mode") || "latest";
  const limit = Number(params.get("limit") || 12);
  const cursor = params.get("cursor") || null;

  if (!FEED_MODES.has(mode)) throw new Error("Unsupported feed mode");

  const result = feedQuerySchema.safeParse({ mode, limit, cursor });
  if (!result.success) throw new Error("Invalid feed limit");

  return result.data;
}

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

export async function getFeedPage(db, viewerId, query) {
  const where = {
    deletedAt: null,
    publishedAt: { lte: new Date() },
    creator: { is: { deletedAt: null } },
  };

  if (query.mode === "following") {
    const follows = await db.follow.findMany({
      where: { followerId: viewerId },
      select: { followingId: true },
    });
    where.creatorId = { in: follows.map((follow) => follow.followingId) };
  }

  if (query.cursor) {
    const cursor = decodeCursor(query.cursor);
    where.AND = [
      {
        OR: [
          { publishedAt: { lt: cursor.publishedAt } },
          { publishedAt: cursor.publishedAt, id: { lt: cursor.id } },
        ],
      },
    ];
  }

  const posts = await db.post.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: query.limit + 1,
    include: postInclude(viewerId),
  });
  const page = posts.slice(0, query.limit);

  return {
    items: page.map((post) =>
      presentPost(
        { ...post, creatorFollowers: post.creator?.followers ?? [] },
        viewerId,
      ),
    ),
    nextCursor: posts.length > query.limit ? encodeCursor(page.at(-1)) : null,
  };
}
