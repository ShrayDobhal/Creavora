import { z } from "zod";
import { CATEGORY_OPTIONS } from "./constants";
import { presentCreator, presentPost } from "./presenters";
import { getPublicHandleCandidates } from "./public-copy";
import { resolvePremiumAvailability } from "./premium";

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
  subscriptionPrice: row.creatorProfile?.subscriptionPrice ?? 0,
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
  const where = { role: "CREATOR", deletedAt: null, banned: false };

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

  let creator = null;
  for (const candidate of getPublicHandleCandidates(handle)) {
    creator = await database.user.findFirst({
      where: { handle: candidate, role: "CREATOR", deletedAt: null, banned: false },
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
    if (creator) break;
  }
  if (!creator) throw new Error("Creator not found");

  const premiumAccess = await resolvePremiumAvailability(database, viewerId, creator.posts);
  const activeSubscription = database.subscription?.findUnique
    ? await database.subscription.findUnique({
        where: { userId_creatorId: { userId: viewerId, creatorId: creator.id } },
        select: { status: true },
      })
    : null;

  return {
    creator: { ...presentDirectoryCreator(creator, viewerId), isSubscribed: activeSubscription?.status === "ACTIVE" },
    posts: creator.posts.map((post) =>
      presentPost(
        { ...post, creatorFollowers: post.creator?.followers ?? [] },
        viewerId,
        premiumAccess.get(post.id),
      ),
    ),
  };
}

export async function getDiscovery(database, viewerId) {
  const baseQuery = {
    where: { role: "CREATOR", deletedAt: null, banned: false },
    take: 8,
    include: creatorInclude(viewerId),
  };
  const [categoryRows, creators] = await Promise.all([
    database.creatorProfile.groupBy({
      by: ["category"],
      _count: { _all: true },
      where: { user: { is: { role: "CREATOR", deletedAt: null, banned: false } } },
    }),
    database.user.findMany({
      ...baseQuery,
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
    }),
  ]);
  const categories = categoryRows
    .map((row) => ({
      name: typeof row.category === "string" ? row.category.trim() : row.category,
      creatorCount: row._count._all,
    }))
    .filter(({ name, creatorCount }) => typeof name === "string" && name && creatorCount > 0)
    .sort((a, b) => b.creatorCount - a.creatorCount || a.name.localeCompare(b.name));

  return {
    categories,
    creators: creators.map((row) => presentDirectoryCreator(row, viewerId)),
  };
}
