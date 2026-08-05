import { expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({
  withAuth: (handler) => handler,
}));

import { createConsumerHomeGet } from "@/app/api/consumer/home/route";
import { createLiveGet } from "@/app/api/live/route";

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
    categories: expect.arrayContaining(["Fitness", "Technology"]),
    creators: expect.any(Array),
    featuredPosts: expect.any(Array),
    stories: expect.any(Array),
    liveSessions: expect.any(Array),
    subscriptions: expect.any(Array),
    unreadNotifications: 3,
  });
  expect(body.viewer).not.toHaveProperty("email");
  expect(findCreators.mock.calls[0][0].take).toBeLessThanOrEqual(12);
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
