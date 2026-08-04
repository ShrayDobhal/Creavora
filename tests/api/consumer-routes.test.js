import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({
  withAuth: (handler) => handler,
  withCreatorAuth: (handler) => handler,
}));

import { createPostsGet, POST as createPost } from "@/app/api/posts/route";
import { createLikePost } from "@/app/api/posts/[id]/like/route";
import { createBookmarkPost } from "@/app/api/posts/[id]/bookmark/route";
import {
  createCommentPost,
  createCommentsGet,
} from "@/app/api/posts/[id]/comment/route";
import { createCreatorsGet } from "@/app/api/creators/route";
import { createCreatorGet } from "@/app/api/creators/[handle]/route";
import { createFollowPost } from "@/app/api/creators/[handle]/follow/route";
import { createSearchGet } from "@/app/api/search/route";
import {
  createSearchHistoryGet,
  createSearchHistoryPost,
} from "@/app/api/search/history/route";
import { createDiscoveryGet } from "@/app/api/discovery/route";

const viewer = { id: "viewer-1", name: "Viewer" };
const authContext = { user: viewer, params: Promise.resolve({}) };

const json = (response) => response.json();

const creatorRow = (overrides = {}) => ({
  id: "creator-1",
  name: "Asha",
  email: "asha@example.test",
  handle: "asha",
  passwordHash: null,
  avatar: null,
  role: "CREATOR",
  walletBalance: 0,
  xp: 0,
  level: 1,
  bio: "Fashion and craft",
  coverImage: null,
  roleTitle: "Fashion Creator",
  verified: true,
  banned: false,
  banReason: null,
  createdAt: new Date("2026-08-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  deletedAt: null,
  creatorProfile: {
    id: "profile-1",
    userId: "creator-1",
    category: "Fashion",
    socialLinks: null,
    payoutMethod: null,
    payoutDetails: null,
    totalEarnings: 0,
    availableBalance: 0,
    subscriberCount: 42,
    monthlyRevenue: 0,
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  },
  followers: [{ id: "follow-1", followerId: "viewer-1", followingId: "creator-1" }],
  posts: [],
  ...overrides,
});

describe("consumer API contracts", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns 400 for an invalid feed limit without querying the feed", async () => {
    const getFeedPage = vi.fn();
    const response = await createPostsGet({ getFeedPage })(
      new Request("http://localhost/api/posts?limit=100"),
      authContext,
    );

    expect(response.status).toBe(400);
    expect(await json(response)).toEqual({ error: "Invalid feed limit" });
    expect(getFeedPage).not.toHaveBeenCalled();
  });

  it("returns the feed service page unchanged", async () => {
    const page = { items: [{ id: "post-1" }], nextCursor: "next-page" };
    const response = await createPostsGet({
      getFeedPage: vi.fn().mockResolvedValue(page),
    })(new Request("http://localhost/api/posts?mode=latest&limit=12"), authContext);

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual(page);
  });

  it("maps social service results and missing targets to stable responses", async () => {
    const likeResponse = await createLikePost({
      toggleLike: vi.fn().mockResolvedValue({ isLiked: true, likesCount: 9 }),
    })(new Request("http://localhost/api/posts/post-1/like", { method: "POST" }), {
      user: viewer,
      params: Promise.resolve({ id: "post-1" }),
    });
    const bookmarkResponse = await createBookmarkPost({
      toggleBookmark: vi.fn().mockResolvedValue({ isBookmarked: true }),
    })(new Request("http://localhost/api/posts/post-1/bookmark", { method: "POST" }), {
      user: viewer,
      params: Promise.resolve({ id: "post-1" }),
    });
    const followResponse = await createFollowPost({
      toggleFollow: vi.fn().mockRejectedValue(new Error("Creator not found")),
    })(new Request("http://localhost/api/creators/missing/follow", { method: "POST" }), {
      user: viewer,
      params: Promise.resolve({ handle: "missing" }),
    });

    expect(await json(likeResponse)).toEqual({ isLiked: true, likesCount: 9 });
    expect(await json(bookmarkResponse)).toEqual({ isBookmarked: true });
    expect(followResponse.status).toBe(404);
    expect(await json(followResponse)).toEqual({ error: "Creator not found" });
  });

  it("returns 400 for an invalid comment body", async () => {
    const response = await createCommentPost({ database: {} })(
      new Request("http://localhost/api/posts/post-1/comment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: "" }),
      }),
      { user: viewer, params: Promise.resolve({ id: "post-1" }) },
    );

    expect(response.status).toBe(400);
    expect(await json(response)).toEqual({ error: "Comment cannot be empty" });
  });

  it("returns 404 before loading comments when the parent post is unavailable", async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: "comment-1" }]);
    const response = await createCommentsGet({
      post: { findFirst: vi.fn().mockResolvedValue(null) },
      comment: { findMany },
    })(new Request("http://localhost/api/posts/post-1/comment"), {
      user: viewer,
      params: Promise.resolve({ id: "post-1" }),
    });

    expect(response.status).toBe(404);
    expect(await json(response)).toEqual({ error: "Post not found" });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON in creator post creation", async () => {
    const response = await createPost(
      new Request("http://localhost/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
      { user: { ...viewer, role: "CREATOR" } },
    );

    expect(response.status).toBe(400);
    expect(await json(response)).toEqual({ error: "Invalid JSON body" });
  });

  it("validates creator directory filters and returns a cursor page", async () => {
    const invalid = await createCreatorsGet({ user: { findMany: vi.fn() } })(
      new Request("http://localhost/api/creators?category=Unknown"),
      authContext,
    );
    const second = creatorRow({ id: "creator-2", handle: "bina", followers: [] });
    const valid = await createCreatorsGet({
      user: { findMany: vi.fn().mockResolvedValue([creatorRow(), second]) },
    })(new Request("http://localhost/api/creators?category=Fashion&q=ash&limit=1"), authContext);

    expect(invalid.status).toBe(400);
    expect(await json(valid)).toMatchObject({
      items: [{ id: "creator-1", category: "Fashion", isFollowing: true }],
      nextCursor: "creator-1",
    });
  });

  it("returns 400 for a malformed creator cursor", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const response = await createCreatorsGet({ user: { findMany } })(
      new Request("http://localhost/api/creators?cursor=not-a-uuid"),
      authContext,
    );

    expect(response.status).toBe(400);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("returns 404 for a missing authenticated creator profile", async () => {
    const response = await createCreatorGet({
      user: { findFirst: vi.fn().mockResolvedValue(null) },
      subscription: { findMany: vi.fn() },
    })(new Request("http://localhost/api/creators/missing"), {
      user: viewer,
      params: Promise.resolve({ handle: "missing" }),
    });

    expect(response.status).toBe(404);
    expect(await json(response)).toEqual({ error: "Creator not found" });
  });

  it("builds discovery category and creator rails from database rows", async () => {
    const response = await createDiscoveryGet({
      user: {
        findMany: vi
          .fn()
          .mockResolvedValueOnce([creatorRow()])
          .mockResolvedValueOnce([creatorRow({ followers: [] })]),
      },
    })(new Request("http://localhost/api/discovery"), authContext);
    const body = await json(response);

    expect(body.categories).toContain("Fashion");
    expect(body.recommended).toMatchObject([{ id: "creator-1", isFollowing: true }]);
    expect(body.trending).toMatchObject([{ id: "creator-1", subscriberCount: 42 }]);
  });

  it("does not write search history while the user is typing an empty query", async () => {
    const mockDb = {
      searchHistory: { create: vi.fn() },
      user: { findMany: vi.fn() },
      post: { findMany: vi.fn() },
      community: { findMany: vi.fn() },
    };
    const response = await createSearchGet(mockDb)(
      new Request("http://localhost/api/search?q="),
      authContext,
    );

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({ creators: [], posts: [], communities: [] });
    expect(mockDb.searchHistory.create).not.toHaveBeenCalled();
  });

  it("rejects unsupported search types without querying", async () => {
    const mockDb = {
      user: { findMany: vi.fn() },
      post: { findMany: vi.fn() },
      community: { findMany: vi.fn() },
    };
    const response = await createSearchGet(mockDb)(
      new Request("http://localhost/api/search?q=asha&type=users"),
      authContext,
    );

    expect(response.status).toBe(400);
    expect(mockDb.user.findMany).not.toHaveBeenCalled();
  });

  it("does not expose premium search-result content without entitlement", async () => {
    const premiumPost = {
      id: "post-premium",
      creatorId: "creator-1",
      content: "Subscriber-only lesson",
      mediaUrl: "https://cdn.example.test/lesson.jpg",
      mediaType: "image",
      isPremium: true,
      price: 499,
      likesCount: 2,
      commentsCount: 1,
      viewsCount: 10,
      sharesCount: 0,
      publishedAt: new Date("2026-08-03T00:00:00.000Z"),
      creator: creatorRow(),
      likes: [],
      bookmarks: [],
    };
    const response = await createSearchGet({
      post: { findMany: vi.fn().mockResolvedValue([premiumPost]) },
      subscription: { findMany: vi.fn().mockResolvedValue([]) },
    })(new Request("http://localhost/api/search?q=lesson&type=posts"), authContext);

    expect(await json(response)).toMatchObject({
      posts: [{ id: "post-premium", content: null, mediaUrl: null, isLocked: true }],
    });
  });

  it("does not return posts owned by non-creators", async () => {
    const nonCreatorPost = {
      id: "user-post",
      creatorId: "user-2",
      content: "Lesson from a normal account",
      mediaUrl: null,
      mediaType: null,
      isPremium: false,
      price: 0,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      sharesCount: 0,
      publishedAt: new Date("2026-08-03T00:00:00.000Z"),
      creator: creatorRow({ id: "user-2", role: "USER", handle: "normal-user" }),
      likes: [],
      bookmarks: [],
    };
    const response = await createSearchGet({
      post: {
        findMany: vi.fn(async ({ where }) =>
          where.creator?.is?.role === "CREATOR" ? [] : [nonCreatorPost],
        ),
      },
      subscription: { findMany: vi.fn().mockResolvedValue([]) },
    })(new Request("http://localhost/api/search?q=lesson&type=posts"), authContext);

    expect(await json(response)).toMatchObject({ posts: [] });
  });

  it("persists search history only through a validated POST", async () => {
    const created = {
      id: "history-1",
      userId: "viewer-1",
      query: "Asha",
      type: "creators",
      createdAt: new Date("2026-08-04T00:00:00.000Z"),
    };
    const database = {
      searchHistory: {
        create: vi.fn().mockResolvedValue(created),
        findMany: vi.fn().mockResolvedValue([created]),
      },
    };
    const postResponse = await createSearchHistoryPost(database)(
      new Request("http://localhost/api/search/history", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: " Asha ", type: "creators" }),
      }),
      authContext,
    );
    const getResponse = await createSearchHistoryGet(database)(
      new Request("http://localhost/api/search/history"),
      authContext,
    );

    expect(postResponse.status).toBe(201);
    expect(await json(postResponse)).toMatchObject({ query: "Asha", type: "creators" });
    expect(await json(getResponse)).toMatchObject([{ id: "history-1" }]);
  });
});
