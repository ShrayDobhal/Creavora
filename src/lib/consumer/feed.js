import { FEED_MODES } from "./constants";
import { presentPost } from "./presenters";
import { feedQuerySchema } from "../validators";

const encodeCursor = (post, mode) => {
  const value = {
    mode,
    ...(mode === "trending"
      ? { likesCount: post.likesCount, commentsCount: post.commentsCount }
      : {}),
    publishedAt: post.publishedAt.toISOString(),
    id: post.id,
  };

  return Buffer.from(JSON.stringify(value)).toString("base64url");
};

const decodeCursor = (cursor, mode) => {
  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString());
    const publishedAt = new Date(value.publishedAt);

    if (
      value.mode !== mode ||
      typeof value.id !== "string" ||
      !value.id ||
      typeof value.publishedAt !== "string" ||
      Number.isNaN(publishedAt.getTime())
    ) {
      throw new Error();
    }
    if (
      mode === "trending" &&
      (!Number.isInteger(value.likesCount) ||
        value.likesCount < 0 ||
        !Number.isInteger(value.commentsCount) ||
        value.commentsCount < 0)
    ) {
      throw new Error();
    }

    return {
      mode,
      ...(mode === "trending"
        ? { likesCount: value.likesCount, commentsCount: value.commentsCount }
        : {}),
      publishedAt,
      id: value.id,
    };
  } catch {
    throw new Error("Invalid feed cursor");
  }
};

const cursorFilter = (cursor, mode) => {
  if (mode !== "trending") {
    return [
      { publishedAt: { lt: cursor.publishedAt } },
      { publishedAt: cursor.publishedAt, id: { lt: cursor.id } },
    ];
  }

  return [
    { likesCount: { lt: cursor.likesCount } },
    {
      likesCount: cursor.likesCount,
      commentsCount: { lt: cursor.commentsCount },
    },
    {
      likesCount: cursor.likesCount,
      commentsCount: cursor.commentsCount,
      publishedAt: { lt: cursor.publishedAt },
    },
    {
      likesCount: cursor.likesCount,
      commentsCount: cursor.commentsCount,
      publishedAt: cursor.publishedAt,
      id: { lt: cursor.id },
    },
  ];
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
    const cursor = decodeCursor(query.cursor, query.mode);
    where.AND = [{ OR: cursorFilter(cursor, query.mode) }];
  }

  const orderBy =
    query.mode === "trending"
      ? [
          { likesCount: "desc" },
          { commentsCount: "desc" },
          { publishedAt: "desc" },
          { id: "desc" },
        ]
      : [{ publishedAt: "desc" }, { id: "desc" }];

  const posts = await db.post.findMany({
    where,
    orderBy,
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
    nextCursor:
      posts.length > query.limit ? encodeCursor(page.at(-1), query.mode) : null,
  };
}
