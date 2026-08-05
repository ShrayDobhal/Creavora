import { sanitizePublicCopy } from "./public-copy";

const includesViewer = (relations, viewerId) =>
  Array.isArray(relations) &&
  relations.some(
    (relation) =>
      relation.userId === viewerId || relation.followerId === viewerId,
  );

export const presentCreator = (row, viewerId) => ({
  id: row.id,
  name: sanitizePublicCopy(row.name),
  handle: sanitizePublicCopy(row.handle),
  avatar: row.avatar,
  roleTitle: sanitizePublicCopy(row.roleTitle),
  verified: row.verified,
  followerCount:
    typeof row._count?.followers === "number" ? row._count.followers : undefined,
  isFollowing: includesViewer(row.creatorFollowers, viewerId),
});

export const presentComment = (row, viewerId) => ({
  ...row,
  content: sanitizePublicCopy(row.content),
  user: row.user
    ? {
        ...row.user,
        name: sanitizePublicCopy(row.user.name),
        handle: sanitizePublicCopy(row.user.handle),
      }
    : row.user,
  viewer: { canManage: row.userId === viewerId },
});

export const presentPost = (row, viewerId) => {
  const isUnavailable = Boolean(row.isPremium);

  return {
    id: row.id,
    content: isUnavailable ? null : sanitizePublicCopy(row.content),
    mediaUrl: isUnavailable ? null : row.mediaUrl,
    mediaType: isUnavailable ? null : row.mediaType,
    category: row.category ?? row.creator?.creatorProfile?.category ?? null,
    isPremium: row.isPremium,
    availability: isUnavailable ? "coming_soon" : "available",
    publishedAt: row.publishedAt,
    counts: {
      likes: row.likesCount,
      comments: row.commentsCount,
      views: row.viewsCount,
      shares: row.sharesCount,
    },
    creator: presentCreator(row.creator, viewerId),
    viewer: {
      isLiked: includesViewer(row.likes, viewerId),
      isBookmarked: includesViewer(row.bookmarks, viewerId),
      isFollowing: includesViewer(row.creatorFollowers, viewerId),
      canManage: row.creatorId === viewerId,
    },
  };
};
