import { z } from "zod";
import { presentPost } from "./presenters";

const SEARCH_TYPES = ["all", "creators", "posts", "communities"];

const searchQuerySchema = z.object({
  q: z.string().trim().max(200),
  type: z.enum(SEARCH_TYPES).default("all"),
});

export const searchHistorySchema = z.object({
  query: z.string().trim().min(1, "Search query is required").max(200),
  type: z.enum(SEARCH_TYPES.filter((type) => type !== "all")).nullable().optional(),
});

export function parseSearchQuery(params) {
  const result = searchQuerySchema.safeParse({
    q: params.get("q") || "",
    type: params.get("type") || "all",
  });
  if (!result.success) throw new Error("Invalid search query");
  return result.data;
}

export async function searchConsumer(database, viewerId, query) {
  if (!query.q) return { creators: [], posts: [], communities: [] };

  const contains = { contains: query.q, mode: "insensitive" };
  const searchesPosts = query.type === "all" || query.type === "posts";
  const [creators, posts, communities, subscriptions] = await Promise.all([
    query.type === "all" || query.type === "creators"
      ? database.user.findMany({
          where: {
            role: "CREATOR",
            deletedAt: null,
            OR: [{ name: contains }, { handle: contains }, { bio: contains }],
          },
          take: 10,
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            roleTitle: true,
            verified: true,
          },
        })
      : [],
    searchesPosts
      ? database.post.findMany({
          where: {
            deletedAt: null,
            publishedAt: { lte: new Date() },
            content: contains,
            creator: { is: { role: "CREATOR", deletedAt: null } },
          },
          take: 15,
          orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
          include: {
            creator: {
              include: {
                creatorProfile: true,
                followers: { where: { followerId: viewerId } },
              },
            },
            likes: { where: { userId: viewerId } },
            bookmarks: { where: { userId: viewerId } },
          },
        })
      : [],
    query.type === "all" || query.type === "communities"
      ? database.community.findMany({
          where: {
            deletedAt: null,
            OR: [{ name: contains }, { description: contains }],
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        })
      : [],
    searchesPosts
      ? database.subscription.findMany({
          where: { userId: viewerId, status: "ACTIVE" },
          select: { creatorId: true },
        })
      : [],
  ]);

  const entitlements = new Set(subscriptions.map(({ creatorId }) => creatorId));
  return {
    creators,
    posts: posts.map((post) =>
      presentPost(
        { ...post, creatorFollowers: post.creator?.followers ?? [] },
        viewerId,
        entitlements,
      ),
    ),
    communities,
  };
}
