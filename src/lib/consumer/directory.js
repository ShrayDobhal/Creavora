import { z } from "zod";
import { CATEGORY_OPTIONS } from "./constants";
import { presentCreator, presentPost } from "./presenters";

const creatorQuerySchema = z.object({
  category: z.enum(["All", ...CATEGORY_OPTIONS]).default("All"),
  q: z.string().trim().max(100).default(""),
  cursor: z.string().trim().min(1).max(191).regex(/^[A-Za-z0-9_-]+$/).nullable().default(null),
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

const creatorInclude = (viewerId) => ({
  creatorProfile: true,
  followers: { where: { followerId: viewerId } },
  _count: { select: { followers: true } },
});

const presentDirectoryCreator = (row, viewerId) => ({
  ...presentCreator({ ...row, creatorFollowers: row.followers }, viewerId),
  coverImage: row.coverImage,
  bio: row.bio,
  category: row.creatorProfile?.category ?? null,
});

export function parseCreatorQuery(params) {
  const result = creatorQuerySchema.safeParse({
    category: params.get("category") || "All",
    q: params.get("q") || "",
    cursor: params.get("cursor") || null,
    limit: params.get("limit") || 12,
  });

  if (!result.success) throw new Error("Invalid creator query");
  return result.data;
}

export async function getCreatorPage(database, viewerId, query) {
  const where = { role: "CREATOR", deletedAt: null };

  if (query.category !== "All") {
    where.creatorProfile = { is: { category: query.category } };
  }
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { handle: { contains: query.q, mode: "insensitive" } },
      { bio: { contains: query.q, mode: "insensitive" } },
    ];
  }

  const rows = await database.user.findMany({
    where,
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    orderBy: [{ verified: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    include: creatorInclude(viewerId),
  });
  const page = rows.slice(0, query.limit);

  return {
    items: page.map((row) => presentDirectoryCreator(row, viewerId)),
    nextCursor: rows.length > query.limit ? page.at(-1).id : null,
  };
}

export async function getCreatorProfile(database, viewerId, handle) {
  if (typeof handle !== "string" || !handle.trim()) {
    throw new Error("Invalid creator handle");
  }

  const creator = await database.user.findFirst({
    where: { handle, role: "CREATOR", deletedAt: null },
    include: {
      ...creatorInclude(viewerId),
      posts: {
        where: { deletedAt: null, publishedAt: { lte: new Date() } },
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        take: 12,
        include: {
          creator: { include: creatorInclude(viewerId) },
          likes: { where: { userId: viewerId } },
          bookmarks: { where: { userId: viewerId } },
        },
      },
    },
  });
  if (!creator) throw new Error("Creator not found");

  return {
    creator: presentDirectoryCreator(creator, viewerId),
    posts: creator.posts.map((post) =>
      presentPost(
        { ...post, creatorFollowers: post.creator?.followers ?? [] },
        viewerId,
      ),
    ),
  };
}

export async function getDiscovery(database, viewerId) {
  const baseQuery = {
    where: { role: "CREATOR", deletedAt: null },
    take: 8,
    include: creatorInclude(viewerId),
  };
  const creators = await database.user.findMany({
    ...baseQuery,
    orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
  });

  return {
    categories: CATEGORY_OPTIONS,
    creators: creators.map((row) => presentDirectoryCreator(row, viewerId)),
  };
}
