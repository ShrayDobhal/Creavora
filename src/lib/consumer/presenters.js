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
  subscriberCount: row.creatorProfile?.subscriberCount ?? 0,
  isFollowing: includesViewer(row.creatorFollowers, viewerId),
});

export const presentPost = (row, viewerId, entitlementSet) => {
  const isEntitled =
    row.creatorId === viewerId || entitlementSet.has(row.creatorId);
  const isLocked = row.isPremium && !isEntitled;

  return {
    id: row.id,
    content: isLocked ? null : row.content,
    mediaUrl: isLocked ? null : row.mediaUrl,
    mediaType: isLocked ? null : row.mediaType,
    isPremium: row.isPremium,
    price: row.price,
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
    },
    isLocked,
  };
};
