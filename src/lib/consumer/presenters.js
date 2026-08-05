const includesViewer = (relations, viewerId) =>
  Array.isArray(relations) &&
  relations.some(
    (relation) =>
      relation.userId === viewerId || relation.followerId === viewerId,
  );

export const presentCreator = (row, viewerId) => ({
  id: row.id,
  name: row.name,
  handle: row.handle,
  avatar: row.avatar,
  roleTitle: row.roleTitle,
  verified: row.verified,
  followerCount:
    typeof row._count?.followers === "number" ? row._count.followers : undefined,
  isFollowing: includesViewer(row.creatorFollowers, viewerId),
});

export const presentPost = (row, viewerId) => {
  const isUnavailable = Boolean(row.isPremium);

  return {
    id: row.id,
    content: isUnavailable ? null : row.content,
    mediaUrl: isUnavailable ? null : row.mediaUrl,
    mediaType: isUnavailable ? null : row.mediaType,
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
