import { expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({
  withAuth: (handler) => handler,
}));

import { createConsumerHomeGet } from "@/app/api/consumer/home/route";
import { createLiveGet } from "@/app/api/live/route";
import {
  createMessagesGet,
  createMessagesPost,
} from "@/app/api/messages/route";
import { createBookmarksGet } from "@/app/api/bookmarks/route";
import {
  createSubscriptionPost,
  createSubscriptionsGet,
} from "@/app/api/subscriptions/route";
import { createWalletDepositPost } from "@/app/api/wallet/deposit/route";
import { createRewardPost } from "@/app/api/rewards/route";
import { createCancelSubscriptionPost } from "@/app/api/subscriptions/cancel/route";
import { POST as createPaymentOrderPost } from "@/app/api/payments/create-order/route";
import { POST as verifyPaymentPost } from "@/app/api/payments/verify/route";
import { databaseIdSchema, sendMessageSchema } from "@/lib/validators";

const fixtureUser = { id: "viewer-1", name: "Riya", role: "USER" };

const creator = {
  id: "creator-1",
  name: "Asha",
  handle: "asha",
  avatar: "https://cdn.example.test/asha.jpg",
  coverImage: "https://cdn.example.test/asha-cover.jpg",
  role: "CREATOR",
  roleTitle: "Fitness coach",
  bio: "Movement for busy days",
  verified: true,
  deletedAt: null,
  createdAt: new Date("2026-08-01T08:00:00.000Z"),
  creatorProfile: { category: "Fitness" },
  followers: [],
  _count: { followers: 12 },
};

const post = {
  id: "post-1",
  creatorId: creator.id,
  content: "A short mobility practice",
  mediaUrl: "https://cdn.example.test/mobility.jpg",
  mediaType: "image",
  isPremium: false,
  likesCount: 18,
  commentsCount: 4,
  viewsCount: 80,
  sharesCount: 2,
  publishedAt: new Date("2026-08-03T08:00:00.000Z"),
  deletedAt: null,
  creator,
  likes: [],
  bookmarks: [],
};

it("returns bounded viewer-safe Home data", async () => {
  const findViewer = vi.fn().mockResolvedValue({
    ...fixtureUser,
    email: "riya@example.test",
    handle: "riya",
    avatar: null,
    roleTitle: null,
    verified: false,
    deletedAt: null,
  });
  const findCreators = vi.fn().mockResolvedValue([creator]);
  const groupCreatorCategories = vi.fn().mockResolvedValue([
    { category: "Fitness", _count: { _all: 1 } },
    { category: "Technology", _count: { _all: 2 } },
  ]);
  const findPosts = vi.fn().mockResolvedValue([post]);
  const findStories = vi.fn().mockResolvedValue([
    {
      id: "story-1",
      mediaUrl: "https://cdn.example.test/story.jpg",
      mediaType: "image",
      caption: "Morning mobility",
      createdAt: new Date("2026-08-03T09:00:00.000Z"),
      user: creator,
    },
  ]);
  const findLiveSessions = vi.fn().mockResolvedValue([
    {
      id: "live-1",
      title: "Mobility check-in",
      description: null,
      thumbnailUrl: "https://cdn.example.test/live.jpg",
      status: "LIVE",
      scheduledAt: null,
      startedAt: new Date("2026-08-03T10:00:00.000Z"),
      viewerCount: 23,
      host: creator,
    },
  ]);
  const findSubscriptions = vi.fn().mockResolvedValue([
    {
      id: "subscription-1",
      tier: "Monthly",
      renewsOn: "2026-09-03",
      status: "ACTIVE",
      creator,
    },
  ]);
  const database = {
    user: { findFirst: findViewer, findMany: findCreators },
    creatorProfile: { groupBy: groupCreatorCategories },
    post: { findMany: findPosts },
    story: { findMany: findStories },
    liveSession: { findMany: findLiveSessions },
    subscription: { findMany: findSubscriptions },
    notification: { count: vi.fn().mockResolvedValue(3) },
  };

  const response = await createConsumerHomeGet({ database })(
    new Request("http://localhost/api/consumer/home"),
    { user: fixtureUser },
  );
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toMatchObject({
    viewer: { id: "viewer-1", name: "Riya", handle: "riya" },
    categories: [
      { name: "Technology", creatorCount: 2 },
      { name: "Fitness", creatorCount: 1 },
    ],
    creators: expect.any(Array),
    featuredPosts: expect.any(Array),
    stories: expect.any(Array),
    liveSessions: expect.any(Array),
    subscriptions: expect.any(Array),
    unreadNotifications: 3,
  });
  expect(body.viewer).not.toHaveProperty("email");
  expect(findCreators.mock.calls[0][0].take).toBeLessThanOrEqual(12);
  expect(groupCreatorCategories).toHaveBeenCalledWith(expect.objectContaining({
    where: { user: { is: { role: "CREATOR", deletedAt: null, banned: false } } },
  }));
  expect(findPosts.mock.calls[0][0]).toMatchObject({ take: 5 });
  expect(findStories.mock.calls[0][0].take).toBeLessThanOrEqual(12);
  expect(findLiveSessions.mock.calls[0][0].take).toBeLessThanOrEqual(12);
  expect(findSubscriptions.mock.calls[0][0].take).toBeLessThanOrEqual(12);
});

it("returns bounded live and scheduled sessions from database rows", async () => {
  const liveSession = {
      id: "live-real",
      title: "Studio check-in",
      description: "A read-only broadcast listing",
      thumbnailUrl: "https://cdn.example.test/live-real.jpg",
      status: "LIVE",
      scheduledAt: null,
      startedAt: new Date("2026-08-05T10:00:00.000Z"),
      viewerCount: 14,
      host: creator,
    };
  const findMany = vi.fn(({ where }) =>
    Promise.resolve(where.status === "LIVE" ? [liveSession] : []),
  );

  const response = await createLiveGet({
    database: { liveSession: { findMany } },
  })(new Request("http://localhost/api/live"), { user: fixtureUser });

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    items: [
      {
        id: "live-real",
        title: "Studio check-in",
        status: "LIVE",
        host: { id: "creator-1", name: "Asha", handle: "asha" },
      },
    ],
  });
  expect(findMany).toHaveBeenCalledTimes(2);
  expect(findMany.mock.calls.map(([query]) => query.where.status)).toEqual([
    "LIVE",
    "SCHEDULED",
  ]);
  expect(findMany.mock.calls.map(([query]) => query.take)).toEqual([12, 12]);
  expect(findMany.mock.calls[0][0].where.host).toEqual({ is: { deletedAt: null } });
});

it("keeps a scheduled session when live rows exceed the live API limit", async () => {
  const liveRows = Array.from({ length: 13 }, (_, index) => ({
    id: `live-${index + 1}`,
    title: `Live session ${index + 1}`,
    description: null,
    thumbnailUrl: null,
    status: "LIVE",
    scheduledAt: null,
    startedAt: new Date(`2026-08-05T${String(index).padStart(2, "0")}:00:00.000Z`),
    viewerCount: index,
    host: creator,
  }));
  const scheduled = {
    ...liveRows[0],
    id: "scheduled-real",
    title: "Tomorrow's studio session",
    status: "SCHEDULED",
    scheduledAt: new Date("2026-08-06T10:00:00.000Z"),
    startedAt: null,
    viewerCount: 0,
  };
  const rows = [...liveRows, scheduled];
  const findMany = vi.fn(({ where, take }) => {
    const statuses = typeof where.status === "string" ? [where.status] : where.status.in;
    return Promise.resolve(rows.filter((row) => statuses.includes(row.status)).slice(0, take));
  });

  const response = await createLiveGet({
    database: { liveSession: { findMany } },
  })(new Request("http://localhost/api/live"), { user: fixtureUser });
  const body = await response.json();

  expect(body.items.filter((session) => session.status === "LIVE")).toHaveLength(12);
  expect(body.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: "scheduled-real",
        status: "SCHEDULED",
      }),
    ]),
  );
});

it("lists persisted conversations and sends by receiver id", async () => {
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Riya",
  };
  const recipient = {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Asha",
    handle: "asha",
    avatar: null,
    roleTitle: "Textile artist",
    verified: true,
  };
  const row = {
    id: "message-1",
    senderId: recipient.id,
    receiverId: user.id,
    content: "Welcome to the studio",
    mediaUrl: null,
    mediaType: null,
    isAudio: false,
    duration: null,
    status: "READ",
    createdAt: new Date("2026-08-05T10:00:00.000Z"),
    sender: recipient,
    receiver: user,
  };
  const findMany = vi.fn().mockResolvedValue([row]);
  const create = vi.fn().mockResolvedValue({
    ...row,
    id: "message-2",
    senderId: user.id,
    receiverId: recipient.id,
    content: "Hello",
    status: "SENT",
    createdAt: new Date("2026-08-05T10:01:00.000Z"),
  });
  const database = {
    message: { findMany, create },
    user: { findFirst: vi.fn().mockResolvedValue(recipient) },
  };

  const response = await createMessagesGet({ database })(
    new Request("http://localhost/api/messages"),
    { user },
  );
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.items[0]).toMatchObject({
    participant: { id: recipient.id, name: "Asha", handle: "asha" },
    lastMessage: { id: "message-1", content: "Welcome to the studio", mine: false },
  });
  expect(findMany.mock.calls[0][0]).toMatchObject({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  const threadResponse = await createMessagesGet({ database })(
    new Request(`http://localhost/api/messages?userId=${recipient.id}`),
    { user },
  );
  expect(await threadResponse.json()).toMatchObject({
    participant: { id: recipient.id },
    items: [{ id: "message-1", content: "Welcome to the studio", mine: false }],
  });

  const sendResponse = await createMessagesPost({ database })(
    new Request("http://localhost/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ receiverId: recipient.id, content: "Hello" }),
    }),
    { user },
  );

  expect(sendResponse.status).toBe(201);
  expect(create).toHaveBeenCalledWith({
    data: {
      senderId: user.id,
      receiverId: recipient.id,
      content: "Hello",
    },
  });
  expect(database.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ banned: false }),
  }));
});

it("sends to a safe imported creator id and rejects unsafe database ids", async () => {
  const importedId = "blindly-demo-user-fitness-1";
  const recipient = {
    id: importedId,
    name: "Neha Kulkarni",
    handle: "everyday-neha",
    avatar: null,
    roleTitle: "Fitness creator",
    verified: true,
  };
  const findFirst = vi.fn().mockResolvedValue(recipient);
  const create = vi.fn().mockResolvedValue({
    id: "message-imported-1",
    senderId: fixtureUser.id,
    receiverId: importedId,
    content: "Hello Neha",
    status: "SENT",
    createdAt: new Date("2026-08-06T00:00:00.000Z"),
  });
  const handler = createMessagesPost({ database: {
    user: { findFirst },
    message: { create },
  } });

  const response = await handler(new Request("http://localhost/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ receiverId: importedId, content: "Hello Neha" }),
  }), { user: fixtureUser });

  expect(response.status).toBe(201);
  expect(create).toHaveBeenCalledWith({
    data: { senderId: fixtureUser.id, receiverId: importedId, content: "Hello Neha" },
  });
  expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: importedId, deletedAt: null, banned: false },
  }));

  expect(databaseIdSchema.safeParse(importedId).success).toBe(true);
  for (const unsafeId of ["", "has space", "path/segment", "dot.id", "x".repeat(192)]) {
    expect(databaseIdSchema.safeParse(unsafeId).success).toBe(false);
    expect(sendMessageSchema.safeParse({ receiverId: unsafeId, content: "No" }).success).toBe(false);
  }
});

it("loads an imported-style message participant id and rejects unsafe GET ids before querying", async () => {
  const importedId = "blindly-demo-user-travel-1";
  const participant = {
    id: importedId,
    name: "Kabir Singh",
    handle: "wander-with-kabir",
    avatar: null,
    roleTitle: "Travel creator",
    verified: true,
  };
  const findParticipant = vi.fn().mockResolvedValue(participant);
  const findMessages = vi.fn().mockResolvedValue([]);
  const handler = createMessagesGet({ database: {
    user: { findFirst: findParticipant },
    message: { findMany: findMessages },
  } });

  const validResponse = await handler(
    new Request(`http://localhost/api/messages?userId=${importedId}`),
    { user: fixtureUser },
  );
  expect(validResponse.status).toBe(200);
  expect(await validResponse.json()).toMatchObject({ participant: { id: importedId }, items: [] });
  expect(findParticipant).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: importedId, deletedAt: null, banned: false },
  }));

  findParticipant.mockClear();
  findMessages.mockClear();
  for (const unsafeId of ["", "has space", "path/segment", "dot.id", "x".repeat(192)]) {
    const invalidResponse = await handler(
      new Request(`http://localhost/api/messages?userId=${encodeURIComponent(unsafeId)}`),
      { user: fixtureUser },
    );
    expect(invalidResponse.status).toBe(400);
    expect(await invalidResponse.json()).toEqual({ error: "Invalid participant ID" });
  }
  expect(findParticipant).not.toHaveBeenCalled();
  expect(findMessages).not.toHaveBeenCalled();
});

it("returns followed creators without messages as suggestions and omits unsafe or existing participants", async () => {
  const user = { id: "user-1", name: "Riya" };
  const existingParticipant = {
    id: "creator-existing",
    name: "Already Messaged",
    handle: "already-messaged",
    avatar: null,
    roleTitle: "Writer",
    verified: false,
  };
  const suggestedParticipant = {
    id: "creator-new",
    name: "New Follow",
    handle: "new-follow",
    avatar: null,
    roleTitle: "Illustrator",
    verified: true,
  };
  const messageFindMany = vi.fn().mockResolvedValue([{
    id: "message-existing",
    senderId: existingParticipant.id,
    receiverId: user.id,
    content: "Hello",
    mediaUrl: null,
    mediaType: null,
    isAudio: false,
    duration: null,
    status: "READ",
    createdAt: new Date("2026-08-05T10:00:00.000Z"),
    sender: existingParticipant,
    receiver: user,
  }]);
  const followFindMany = vi.fn().mockResolvedValue([
    { following: suggestedParticipant },
    { following: { ...user, handle: "riya", avatar: null, roleTitle: null, verified: false } },
    { following: { ...suggestedParticipant, id: "creator-deleted", name: "Deleted Follow", deletedAt: new Date() } },
    { following: existingParticipant },
  ]);

  const response = await createMessagesGet({
    database: {
      message: { findMany: messageFindMany },
      follow: { findMany: followFindMany },
    },
  })(new Request("http://localhost/api/messages"), { user });

  expect(await response.json()).toMatchObject({
    items: [{ participant: { id: "creator-existing" } }],
    suggestions: [{ id: "creator-new", name: "New Follow", handle: "new-follow", verified: true }],
  });
  expect(followFindMany).toHaveBeenCalledWith(expect.objectContaining({
    where: {
      followerId: user.id,
      followingId: { notIn: [existingParticipant.id] },
      following: { is: { role: "CREATOR", deletedAt: null, banned: false } },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  }));
});

it("filters existing conversations before limiting message suggestions", async () => {
  const existingIds = Array.from({ length: 12 }, (_, index) => `creator-${index + 1}`);
  const eligible = { id: "creator-13", name: "Thirteenth Follow", handle: "follow-13", avatar: null, roleTitle: "Artist", verified: false };
  const messages = existingIds.map((id, index) => ({
    id: `message-${index}`,
    senderId: id,
    receiverId: fixtureUser.id,
    content: "Existing",
    createdAt: new Date(),
    sender: { ...eligible, id },
    receiver: fixtureUser,
  }));
  const followFindMany = vi.fn().mockResolvedValue([{ following: eligible }]);

  const response = await createMessagesGet({ database: {
    message: { findMany: vi.fn().mockResolvedValue(messages) },
    follow: { findMany: followFindMany },
  } })(new Request("http://localhost/api/messages"), { user: fixtureUser });

  expect((await response.json()).suggestions).toMatchObject([{ id: eligible.id }]);
  expect(followFindMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ followingId: { notIn: existingIds } }),
    take: 12,
  }));
});

it("returns bookmarked posts through the shared safe post presenter", async () => {
  const bookmark = {
    id: "bookmark-1",
    createdAt: new Date("2026-08-05T11:00:00.000Z"),
    post: {
      ...post,
      creator: { ...creator, followers: [] },
      bookmarks: [{ userId: fixtureUser.id }],
    },
  };
  const findMany = vi.fn().mockResolvedValue([bookmark]);

  const response = await createBookmarksGet({
    database: { bookmark: { findMany } },
  })(new Request("http://localhost/api/bookmarks"), { user: fixtureUser });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.items).toEqual([
    expect.objectContaining({
      id: "post-1",
      content: "A short mobility practice",
      creator: expect.objectContaining({ id: "creator-1", name: "Asha" }),
      viewer: expect.objectContaining({ isBookmarked: true }),
    }),
  ]);
  expect(findMany.mock.calls[0][0]).toMatchObject({
    where: { userId: fixtureUser.id, post: { deletedAt: null } },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          creator: { include: { followers: { where: { followerId: fixtureUser.id } } } },
          bookmarks: { where: { userId: fixtureUser.id } },
        },
      },
    },
  });
  expect(findMany.mock.calls[0][0].include.post.include).not.toHaveProperty("creatorFollowers");
});

it("excludes saved posts owned by a soft-deleted creator", async () => {
  const findMany = vi.fn().mockResolvedValue([]);

  await createBookmarksGet({
    database: { bookmark: { findMany } },
  })(new Request("http://localhost/api/bookmarks"), { user: fixtureUser });

  expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: {
      userId: fixtureUser.id,
      post: {
        deletedAt: null,
        creator: { is: { deletedAt: null } },
      },
    },
  }));
});

it.each([
  ["wallet deposit", createWalletDepositPost],
  ["reward claim", createRewardPost],
])("rejects unconfigured %s without mutating data", async (_name, createHandler) => {
  const database = {
    $transaction: vi.fn(),
    user: { update: vi.fn() },
    notification: { create: vi.fn() },
  };
  const response = await createHandler({ database })(
    new Request("http://localhost/api/unavailable", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }),
    { user: fixtureUser },
  );

  expect(response.status).toBe(501);
  expect(await response.json()).toEqual({ error: "This feature is not available yet" });
  expect(database.$transaction).not.toHaveBeenCalled();
  expect(database.user.update).not.toHaveBeenCalled();
  expect(database.notification.create).not.toHaveBeenCalled();
});

it.each([
  ["payment order creation", createPaymentOrderPost],
  ["payment verification", verifyPaymentPost],
])("disables the direct %s endpoint before reading its body", async (_name, handler) => {
  const readBody = vi.fn(() => {
    throw new Error("request body must not be read");
  });

  const response = await handler({ json: readBody }, { user: fixtureUser });

  expect(response.status).toBe(501);
  expect(await response.json()).toEqual({ error: "This feature is not available yet" });
  expect(readBody).not.toHaveBeenCalled();
});

it("returns active non-subscribed creators as subscription recommendations", async () => {
  const activeSubscription = {
    id: "subscription-1",
    tier: "Community access",
    renewsOn: "No renewal",
    status: "ACTIVE",
    creator,
  };
  const findSubscriptions = vi.fn().mockResolvedValue([activeSubscription]);
  const findCreators = vi.fn().mockResolvedValue([{
    ...creator,
    id: "creator-2",
    name: "Dev",
    avatar: "https://cdn.example.test/dev.jpg",
    creatorProfile: { category: "Technology" },
    _count: { followers: 27 },
  }]);

  const response = await createSubscriptionsGet({
    database: {
      subscription: { findMany: findSubscriptions },
      user: { findMany: findCreators },
    },
  })(new Request("http://localhost/api/subscriptions"), { user: fixtureUser });

  expect(await response.json()).toMatchObject({
    items: [{ id: "subscription-1", creator: { id: creator.id } }],
    recommendations: [{
      id: "creator-2",
      name: "Dev",
      avatar: "https://cdn.example.test/dev.jpg",
      category: "Technology",
      followerCount: 27,
    }],
  });
  expect(findCreators).toHaveBeenCalledWith(expect.objectContaining({
    where: {
      id: { not: fixtureUser.id },
      role: "CREATOR",
      deletedAt: null,
      banned: false,
      creatorSubs: { none: { userId: fixtureUser.id } },
    },
    take: 12,
    select: expect.objectContaining({
      avatar: true,
      creatorProfile: { select: { category: true } },
      _count: { select: { followers: true } },
    }),
  }));
});

it("creates a free community subscription with server-controlled values", async () => {
  const findUnique = vi.fn().mockResolvedValue(null);
  const create = vi.fn().mockResolvedValue({
    id: "subscription-2",
    userId: fixtureUser.id,
    creatorId: creator.id,
    tier: "Community access",
    price: 0,
    method: "FREE",
    status: "ACTIVE",
    renewsOn: "No renewal",
    cancelledAt: null,
    creator,
  });
  const transaction = vi.fn((callback) => callback({
    user: { findFirst: vi.fn().mockResolvedValue(creator) },
    subscription: { findUnique, create },
  }));

  const response = await createSubscriptionPost({ database: { $transaction: transaction } })(
    new Request("http://localhost/api/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ creatorId: creator.id, tier: "Paid plan", price: 999 }),
    }),
    { user: fixtureUser },
  );

  expect(response.status).toBe(201);
  expect(await response.json()).toMatchObject({ created: true, subscription: { id: "subscription-2" } });
  expect(create).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({
      userId: fixtureUser.id,
      creatorId: creator.id,
      tier: "Community access",
      price: 0,
      method: "FREE",
      status: "ACTIVE",
      renewsOn: "No renewal",
      cancelledAt: null,
    }),
  }));
});

it("keeps an active free subscription idempotent and reactivates only a cancelled free row", async () => {
  const free = { tier: "Community access", price: 0, method: "FREE" };
  const existing = { id: "subscription-1", ...free, status: "ACTIVE", cancelledAt: null, creator };
  const cancelled = { id: "subscription-2", ...free, status: "CANCELLED", cancelledAt: new Date(), creator };
  const createHandler = (row) => {
    const update = vi.fn().mockResolvedValue({ ...row, status: "ACTIVE", cancelledAt: null, creator });
    return {
      handler: createSubscriptionPost({
        database: {
          $transaction: (callback) => callback({
            user: { findFirst: vi.fn().mockResolvedValue(creator) },
            subscription: { findUnique: vi.fn().mockResolvedValue(row), update, create: vi.fn() },
          }),
        },
      }),
      update,
    };
  };
  const request = () => new Request("http://localhost/api/subscriptions", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ creatorId: creator.id }),
  });

  const active = createHandler(existing);
  const activeResponse = await active.handler(request(), { user: fixtureUser });
  expect(await activeResponse.json()).toMatchObject({ created: false, subscription: { id: existing.id, status: "ACTIVE" } });

  const reactivated = createHandler(cancelled);
  const reactivatedResponse = await reactivated.handler(request(), { user: fixtureUser });
  expect(await reactivatedResponse.json()).toMatchObject({ created: false, subscription: { id: cancelled.id, status: "ACTIVE", cancelledAt: null } });
  expect(reactivated.update).toHaveBeenCalledTimes(1);
});

it("preserves cancelled paid subscription history instead of converting it to free", async () => {
  const paid = { id: "subscription-paid", tier: "Premium", price: 499, method: "UPI", status: "CANCELLED", creator };
  const update = vi.fn();
  const create = vi.fn();
  const response = await createSubscriptionPost({ database: { $transaction: (callback) => callback({
    user: { findFirst: vi.fn().mockResolvedValue(creator) },
    subscription: { findUnique: vi.fn().mockResolvedValue(paid), update, create },
  }) } })(new Request("http://localhost/api/subscriptions", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ creatorId: creator.id }),
  }), { user: fixtureUser });

  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({ error: "A recorded subscription already exists for this creator" });
  expect(update).not.toHaveBeenCalled();
  expect(create).not.toHaveBeenCalled();
});

it("returns the compatible winning subscription when concurrent first join loses a unique race", async () => {
  const uniqueRace = Object.assign(new Error("Unique constraint"), { code: "P2002" });
  const winner = {
    id: "subscription-winner",
    userId: fixtureUser.id,
    creatorId: creator.id,
    tier: "Community access",
    price: 0,
    method: "FREE",
    status: "ACTIVE",
    renewsOn: "No renewal",
    cancelledAt: null,
    creator,
  };
  const refetch = vi.fn().mockResolvedValue(winner);
  const response = await createSubscriptionPost({ database: {
    $transaction: (callback) => callback({
      user: { findFirst: vi.fn().mockResolvedValue(creator) },
      subscription: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockRejectedValue(uniqueRace),
      },
    }),
    subscription: { findUnique: refetch },
  } })(new Request("http://localhost/api/subscriptions", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ creatorId: creator.id }),
  }), { user: fixtureUser });

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ created: false, subscription: { id: winner.id, status: "ACTIVE" } });
  expect(refetch).toHaveBeenCalledWith(expect.objectContaining({
    where: { userId_creatorId: { userId: fixtureUser.id, creatorId: creator.id } },
  }));
});

it.each([
  ["self", fixtureUser],
  ["non-creator", { ...creator, role: "USER" }],
  ["deleted creator", { ...creator, deletedAt: new Date() }],
  ["banned creator", { ...creator, banned: true }],
])("rejects a %s subscription target", async (_name, target) => {
  const findFirst = vi.fn().mockResolvedValue(target.id === fixtureUser.id ? null : null);
  const response = await createSubscriptionPost({
    database: {
      $transaction: (callback) => callback({
        user: { findFirst },
        subscription: { findUnique: vi.fn(), upsert: vi.fn() },
      }),
    },
  })(new Request("http://localhost/api/subscriptions", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ creatorId: target.id }),
  }), { user: fixtureUser });

  expect(response.status).toBe(target.id === fixtureUser.id ? 400 : 404);
  if (target.id !== fixtureUser.id) {
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: target.id, role: "CREATOR", deletedAt: null, banned: false },
    }));
  }
});

it("cancels only the viewer's subscription by subscription id without deleting it", async () => {
  const findFirst = vi.fn().mockResolvedValue({ id: "subscription-1", userId: fixtureUser.id, creatorId: creator.id, status: "ACTIVE" });
  const update = vi.fn().mockResolvedValue({ id: "subscription-1", userId: fixtureUser.id, creatorId: creator.id, status: "CANCELLED", cancelledAt: new Date() });
  const response = await createCancelSubscriptionPost({ database: { subscription: { findFirst, update } } })(
    new Request("http://localhost/api/subscriptions/cancel", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscriptionId: "subscription-1" }),
    }),
    { user: fixtureUser },
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ subscription: { id: "subscription-1", status: "CANCELLED" } });
  expect(update).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: "subscription-1", userId: fixtureUser.id, status: "ACTIVE" },
    data: expect.objectContaining({ status: "CANCELLED", cancelledAt: expect.any(Date) }),
  }));
});

it("does not cancel a subscription belonging to another viewer", async () => {
  const update = vi.fn();
  const response = await createCancelSubscriptionPost({
    database: { subscription: { findFirst: vi.fn().mockResolvedValue(null), update } },
  })(new Request("http://localhost/api/subscriptions/cancel", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscriptionId: "subscription-1" }),
  }), { user: fixtureUser });

  expect(response.status).toBe(404);
  expect(update).not.toHaveBeenCalled();
});
