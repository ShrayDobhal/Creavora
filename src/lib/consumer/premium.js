const byNewest = (left, right) => {
  const time = new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  return time || String(right.id).localeCompare(String(left.id));
};

export async function resolvePremiumAvailability(database, viewerId, posts) {
  const premiumPosts = posts.filter((post) => post.isPremium);
  if (!premiumPosts.length) return new Map();

  const creatorIds = [...new Set(premiumPosts.map((post) => post.creatorId))];
  const subscriptions = database.subscription?.findMany
    ? await database.subscription.findMany({
        where: { userId: viewerId, creatorId: { in: creatorIds }, status: "ACTIVE" },
        select: { creatorId: true },
      })
    : [];
  const subscribedCreators = new Set(subscriptions.map((subscription) => subscription.creatorId));

  const previewIdsByCreator = new Map();
  await Promise.all(creatorIds.map(async (creatorId) => {
    const rows = database.post?.findMany
      ? await database.post.findMany({
          where: { creatorId, isPremium: true, deletedAt: null, publishedAt: { lte: new Date() } },
          orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
          take: 2,
          select: { id: true },
        })
      : premiumPosts.filter((post) => post.creatorId === creatorId).sort(byNewest).slice(0, 2);
    previewIdsByCreator.set(creatorId, rows.map((row) => row.id));
  }));

  return new Map(premiumPosts.map((post) => {
    if (post.creatorId === viewerId || subscribedCreators.has(post.creatorId)) {
      return [post.id, { availability: "available", previewIndex: null }];
    }
    const previewIndex = (previewIdsByCreator.get(post.creatorId) || []).indexOf(post.id);
    return [post.id, previewIndex >= 0
      ? { availability: "preview", previewIndex: previewIndex + 1 }
      : { availability: "locked", previewIndex: null }];
  }));
}
