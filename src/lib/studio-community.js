import { z } from "zod";

const communityActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create-community"), name: z.string().trim().min(3).max(80), description: z.string().trim().max(500).optional().default("") }),
  z.object({ action: z.literal("create-post"), content: z.string().trim().min(1).max(3000), kind: z.enum(["POST", "DISCUSSION", "ANNOUNCEMENT"]).default("POST") }),
  z.object({ action: z.literal("toggle-like"), postId: z.string().trim().min(1) }),
  z.object({ action: z.literal("reply"), postId: z.string().trim().min(1), content: z.string().trim().min(1).max(1500) }),
  z.object({ action: z.literal("create-event"), title: z.string().trim().min(3).max(120), description: z.string().trim().max(1000).optional().default(""), startAt: z.string().trim().min(1), location: z.string().trim().max(300).optional().default(""), type: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).default("ONLINE") }),
  z.object({ action: z.literal("create-room"), title: z.string().trim().min(3).max(120), description: z.string().trim().max(1000).optional().default(""), scheduledAt: z.string().trim().min(1) }),
]);

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  handle: user.handle,
  avatar: user.avatar,
  roleTitle: user.roleTitle,
  verified: user.verified,
});

const parseDate = (value, label) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is invalid`);
  return date;
};

async function ownedCommunity(database, userId) {
  return database.community.findFirst({ where: { ownerId: userId, deletedAt: null }, orderBy: { createdAt: "asc" } });
}

export async function loadStudioCommunity(database, user) {
  const base = await database.community.findFirst({
    where: { ownerId: user.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { members: true, posts: true, events: true } },
      members: {
        orderBy: { joinedAt: "asc" },
        take: 200,
        include: { user: { select: { id: true, name: true, handle: true, avatar: true, roleTitle: true, verified: true } } },
      },
      posts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          author: { select: { id: true, name: true, handle: true, avatar: true, roleTitle: true, verified: true } },
          likes: { select: { userId: true } },
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            take: 50,
            include: { author: { select: { id: true, name: true, handle: true, avatar: true, roleTitle: true, verified: true } } },
          },
        },
      },
      events: { orderBy: { startAt: "asc" }, take: 100 },
    },
  });

  if (!base) return { community: null, viewer: publicUser(user) };

  const rooms = await database.liveSession.findMany({
    where: { communityId: base.id, hostId: user.id },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const memberMap = new Map(base.members.map((member) => [member.user.id, { ...publicUser(member.user), role: member.role, joinedAt: member.joinedAt }]));
  if (!memberMap.has(user.id)) memberMap.set(user.id, { ...publicUser(user), role: "OWNER", joinedAt: base.createdAt });
  const scoreMap = new Map([...memberMap.keys()].map((id) => [id, { posts: 0, replies: 0, likesReceived: 0, points: 0 }]));
  for (const post of base.posts) {
    const authorScore = scoreMap.get(post.authorId) || { posts: 0, replies: 0, likesReceived: 0, points: 0 };
    authorScore.posts += 1;
    authorScore.likesReceived += post.likes.length;
    authorScore.points += 10 + (post.likes.length * 2);
    scoreMap.set(post.authorId, authorScore);
    for (const reply of post.replies) {
      const replyScore = scoreMap.get(reply.authorId) || { posts: 0, replies: 0, likesReceived: 0, points: 0 };
      replyScore.replies += 1;
      replyScore.points += 5;
      scoreMap.set(reply.authorId, replyScore);
    }
  }

  const members = [...memberMap.values()];
  const leaderboard = members
    .map((member) => ({ ...member, ...(scoreMap.get(member.id) || { posts: 0, replies: 0, likesReceived: 0, points: 0 }) }))
    .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name));

  return {
    viewer: publicUser(user),
    community: {
      id: base.id,
      name: base.name,
      description: base.description,
      avatar: base.avatar,
      coverImage: base.coverImage,
      isPrivate: base.isPrivate,
      createdAt: base.createdAt,
      counts: { members: Math.max(base._count.members, members.length), posts: base._count.posts, events: base._count.events, rooms: rooms.length },
    },
    posts: base.posts.map((post) => ({
      id: post.id,
      content: post.content,
      kind: post.kind,
      mediaUrl: post.mediaUrl,
      isPinned: post.isPinned,
      likesCount: post.likesCount,
      repliesCount: post.repliesCount,
      createdAt: post.createdAt,
      author: publicUser(post.author),
      viewerLiked: post.likes.some((like) => like.userId === user.id),
      replies: post.replies.map((reply) => ({ id: reply.id, content: reply.content, createdAt: reply.createdAt, author: publicUser(reply.author) })),
    })),
    rooms,
    events: base.events,
    members,
    leaderboard,
  };
}

export async function mutateStudioCommunity(database, user, input) {
  const data = communityActionSchema.parse(input);
  if (data.action === "create-community") {
    const existing = await ownedCommunity(database, user.id);
    if (existing) throw new Error("Your creator community already exists");
    return database.$transaction(async (transaction) => {
      const subscriptions = await transaction.subscription.findMany({ where: { creatorId: user.id, status: "ACTIVE" }, select: { userId: true } });
      const community = await transaction.community.create({ data: { ownerId: user.id, name: data.name, description: data.description || null, memberCount: subscriptions.length + 1 } });
      await transaction.communityMember.createMany({ data: [
        { communityId: community.id, userId: user.id, role: "OWNER" },
        ...subscriptions.filter((subscription) => subscription.userId !== user.id).map((subscription) => ({ communityId: community.id, userId: subscription.userId, role: "MEMBER" })),
      ], skipDuplicates: true });
      return { communityId: community.id };
    });
  }

  const community = await ownedCommunity(database, user.id);
  if (!community) throw new Error("Create your community first");

  if (data.action === "create-post") {
    return database.communityPost.create({ data: { communityId: community.id, authorId: user.id, content: data.content, kind: data.kind } });
  }
  if (data.action === "toggle-like") {
    return database.$transaction(async (transaction) => {
      const post = await transaction.communityPost.findFirst({ where: { id: data.postId, communityId: community.id, deletedAt: null } });
      if (!post) throw new Error("Community post not found");
      const existing = await transaction.communityPostLike.findUnique({ where: { postId_userId: { postId: post.id, userId: user.id } } });
      if (existing) {
        await transaction.communityPostLike.delete({ where: { id: existing.id } });
        const updated = await transaction.communityPost.update({ where: { id: post.id }, data: { likesCount: { decrement: 1 } } });
        return { isLiked: false, likesCount: Math.max(0, updated.likesCount) };
      }
      await transaction.communityPostLike.create({ data: { postId: post.id, userId: user.id } });
      const updated = await transaction.communityPost.update({ where: { id: post.id }, data: { likesCount: { increment: 1 } } });
      return { isLiked: true, likesCount: updated.likesCount };
    });
  }
  if (data.action === "reply") {
    return database.$transaction(async (transaction) => {
      const post = await transaction.communityPost.findFirst({ where: { id: data.postId, communityId: community.id, deletedAt: null } });
      if (!post) throw new Error("Community post not found");
      const reply = await transaction.communityReply.create({ data: { postId: post.id, authorId: user.id, content: data.content }, include: { author: true } });
      const updated = await transaction.communityPost.update({ where: { id: post.id }, data: { repliesCount: { increment: 1 } } });
      return { reply: { id: reply.id, content: reply.content, createdAt: reply.createdAt, author: publicUser(reply.author) }, repliesCount: updated.repliesCount };
    });
  }
  if (data.action === "create-event") {
    return database.event.create({ data: { communityId: community.id, title: data.title, description: data.description || null, startAt: parseDate(data.startAt, "Event time"), location: data.location || null, type: data.type } });
  }
  return database.liveSession.create({ data: { communityId: community.id, hostId: user.id, title: data.title, description: data.description || null, scheduledAt: parseDate(data.scheduledAt, "Room time"), status: "SCHEDULED" } });
}

export function parseCommunityAction(input) {
  return communityActionSchema.parse(input);
}
