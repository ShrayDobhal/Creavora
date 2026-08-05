import { expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({
  withAuth: (handler) => handler,
}));

import { createConsumerHomeGet } from "@/app/api/consumer/home/route";

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
