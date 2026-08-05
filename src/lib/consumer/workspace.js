import { getDiscovery } from "./directory";
import { getFeedPage } from "./feed";
import { presentCreator } from "./presenters";

const STORY_LIMIT = 8;
const LIVE_SESSION_LIMIT = 4;
const SUBSCRIPTION_LIMIT = 4;

const creatorInclude = (viewerId) => ({
  creatorProfile: true,
  followers: { where: { followerId: viewerId } },
  _count: { select: { followers: true } },
});

const presentHomeCreator = (row, viewerId) => ({
  ...presentCreator({ ...row, creatorFollowers: row.followers }, viewerId),
  coverImage: row.coverImage ?? null,
  bio: row.bio ?? null,
  category: row.creatorProfile?.category ?? null,
});

const loadViewer = async (database, viewerId) => {
  const viewer = await database.user.findFirst({
    where: { id: viewerId, deletedAt: null },
    select: {
      id: true,
      name: true,
      handle: true,
      avatar: true,
      roleTitle: true,
      verified: true,
    },
  });
  if (!viewer) throw new Error("Viewer not found");

  return {
    id: viewer.id,
    name: viewer.name,
    handle: viewer.handle,
    avatar: viewer.avatar,
    roleTitle: viewer.roleTitle,
    verified: viewer.verified,
  };
};

const loadStories = async (database, viewerId) => {
  const rows = await database.story.findMany({
    where: {
      deletedAt: null,
      expiresAt: { gt: new Date() },
      user: { is: { role: "CREATOR", deletedAt: null } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: STORY_LIMIT,
    include: { user: { include: creatorInclude(viewerId) } },
  });

  return rows.map((story) => ({
    id: story.id,
    mediaUrl: story.mediaUrl,
    mediaType: story.mediaType,
    caption: story.caption,
    createdAt: story.createdAt,
    creator: presentHomeCreator(story.user, viewerId),
  }));
};

export const getLiveSessions = async (
  database,
  viewerId,
  { limit = 12 } = {},
) => {
  const take = Math.min(limit, 12);
  const include = { host: { include: creatorInclude(viewerId) } };
  const hostIsActive = { is: { deletedAt: null } };
  const [liveRows, scheduledRows] = await Promise.all([
    database.liveSession.findMany({
      where: { status: "LIVE", host: hostIsActive },
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      take,
      include,
    }),
    database.liveSession.findMany({
      where: { status: "SCHEDULED", host: hostIsActive },
      orderBy: [{ scheduledAt: "asc" }, { id: "desc" }],
      take,
      include,
    }),
  ]);

  return [...liveRows, ...scheduledRows].map((session) => ({
    id: session.id,
    title: session.title,
    description: session.description,
    thumbnailUrl: session.thumbnailUrl,
    status: session.status,
    scheduledAt: session.scheduledAt,
    startedAt: session.startedAt,
    viewerCount: session.viewerCount,
    host: presentHomeCreator(session.host, viewerId),
  }));
};

const loadSubscriptions = async (database, viewerId) => {
  const rows = await database.subscription.findMany({
    where: {
      userId: viewerId,
      status: "ACTIVE",
      creator: { is: { deletedAt: null } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: SUBSCRIPTION_LIMIT,
    include: { creator: { include: creatorInclude(viewerId) } },
  });

  return rows.map((subscription) => ({
    id: subscription.id,
    tier: subscription.tier,
    renewsOn: subscription.renewsOn,
    status: subscription.status,
    creator: presentHomeCreator(subscription.creator, viewerId),
  }));
};

const countUnreadNotifications = (database, viewerId) =>
  database.notification.count({ where: { userId: viewerId, read: false } });

export async function getConsumerHome(database, viewerId) {
  const [
    viewer,
    discovery,
    featured,
    stories,
    liveSessions,
    subscriptions,
    unreadNotifications,
  ] = await Promise.all([
    loadViewer(database, viewerId),
    getDiscovery(database, viewerId),
    getFeedPage(database, viewerId, {
      mode: "trending",
      limit: 4,
      cursor: null,
    }),
    loadStories(database, viewerId),
    getLiveSessions(database, viewerId, { limit: LIVE_SESSION_LIMIT }),
    loadSubscriptions(database, viewerId),
    countUnreadNotifications(database, viewerId),
  ]);

  return {
    viewer,
    categories: discovery.categories,
    creators: discovery.creators,
    featuredPosts: featured.items,
    stories,
    liveSessions,
    subscriptions,
    unreadNotifications,
  };
}
