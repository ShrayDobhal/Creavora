import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  assertDemoImportEnvironment,
  importBlindlyDemoContent,
  runDemoContentImport,
} from "../../scripts/import-blindly-demo-content.mjs";

const LAUNCH_CATEGORIES = [
  "Fitness",
  "Sports",
  "Technology",
  "Fashion",
  "Food",
  "Travel",
  "Education",
  "Music",
  "Art",
  "Comedy",
  "Gaming",
  "Lifestyle",
];

function createTable(keyForWhere) {
  const records = new Map();

  return {
    records,
    upsert: vi.fn(async ({ where, update, create }) => {
      const key = keyForWhere(where);
      const current = records.get(key);
      const record = current ? { ...current, ...update } : { ...create };
      records.set(key, record);
      return record;
    }),
  };
}

function createUserTable() {
  const records = new Map();

  return {
    records,
    upsert: vi.fn(async ({ where, update, create }) => {
      const current = [...records.values()].find((record) => (
        Object.entries(where).every(([field, value]) => record[field] === value)
      ));
      if (current) {
        const record = { ...current, ...update };
        records.set(record.id, record);
        return record;
      }

      const collides = [...records.values()].some((record) => (
        record.email === create.email || record.handle === create.handle
      ));
      if (collides) {
        throw new Error("Unique constraint failed");
      }
      records.set(create.id, { ...create });
      return { ...create };
    }),
  };
}

function createDatabase() {
  return {
    user: createUserTable(),
    creatorProfile: createTable((where) => where.userId),
    post: createTable((where) => where.id),
    story: createTable((where) => where.id),
    liveSession: createTable((where) => where.id),
    follow: createTable(({ followerId_followingId }) => (
      `${followerId_followingId.followerId}:${followerId_followingId.followingId}`
    )),
    like: createTable(({ userId_postId }) => `${userId_postId.userId}:${userId_postId.postId}`),
    comment: createTable((where) => where.id),
  };
}

describe("Blindly production demo-content importer", () => {
  it("documents the explicit importer guard", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("BLINDLY_DEMO_CONTENT_CONFIRMATION=blindly-production-demo-content");
    expect(readme).toContain("not part of the Vercel build");
  });

  it("requires exact production confirmation", () => {
    expect(() => assertDemoImportEnvironment({
      DATABASE_URL: "postgresql://host/db",
    })).toThrow("BLINDLY_DEMO_CONTENT_CONFIRMATION");

    expect(() => assertDemoImportEnvironment({
      DATABASE_URL: "postgresql://host/db",
      BLINDLY_DEMO_CONTENT_CONFIRMATION: "yes",
    })).toThrow("BLINDLY_DEMO_CONTENT_CONFIRMATION");
  });

  it.each([
    undefined,
    "",
    "mysql://host/db",
    "https://host/db",
    "postgres-example://host/db",
    "postgresql:foo",
    "postgresql:/db",
    "postgresql:///db",
    "postgresql://host",
    "postgresql://host/",
  ])("rejects non-PostgreSQL DATABASE_URL value %s", (databaseUrl) => {
    expect(() => assertDemoImportEnvironment({
      DATABASE_URL: databaseUrl,
      BLINDLY_DEMO_CONTENT_CONFIRMATION: "blindly-production-demo-content",
    })).toThrow("DATABASE_URL must be a PostgreSQL URL");
  });

  it("validates the environment before creating a database connection", async () => {
    const createDatabaseClient = vi.fn();

    await expect(runDemoContentImport({
      env: { DATABASE_URL: "postgresql://host/db" },
      createDatabaseClient,
    })).rejects.toThrow("BLINDLY_DEMO_CONTENT_CONFIRMATION");
    expect(createDatabaseClient).not.toHaveBeenCalled();
  });

  it("upserts the complete India launch experience with clean public copy", async () => {
    const database = createDatabase();
    const now = new Date("2026-08-05T09:00:00.000Z");

    const counts = await importBlindlyDemoContent({ database, now });

    expect(counts).toEqual({
      users: 12,
      creatorProfiles: 12,
      posts: 60,
      stories: 12,
      liveSessions: 4,
      follows: 12,
      likes: 60,
      comments: 12,
    });
    expect(database.user.records.size).toBe(12);
    expect(database.creatorProfile.records.size).toBe(12);
    expect(database.post.records.size).toBe(60);
    expect(database.story.records.size).toBe(12);
    expect(database.liveSession.records.size).toBe(4);

    const users = [...database.user.records.values()];
    const categories = [...database.creatorProfile.records.values()].map(({ category }) => category);
    const posts = [...database.post.records.values()];
    const stories = [...database.story.records.values()];
    const liveSessions = [...database.liveSession.records.values()];
    const postsById = new Map(posts.map((post) => [post.id, post]));
    const categoryByCreatorId = new Map(
      [...database.creatorProfile.records.values()].map((profile) => [profile.userId, profile.category]),
    );
    const visibleCopy = [
      ...users.flatMap((user) => [user.name, user.handle, user.bio, user.roleTitle]),
      ...posts.map((post) => post.content),
      ...stories.map((story) => story.caption),
      ...liveSessions.map((session) => session.title),
      ...[...database.comment.records.values()].map((comment) => comment.content),
    ].join(" ");

    expect(users.every(({ email }) => email.endsWith("@blindly.demo"))).toBe(true);
    expect(visibleCopy).not.toMatch(/\[blindly-demo:|\(Blindly Demo\)|blindly-demo-/i);
    expect(users.map((user) => user.handle)).toEqual(
      expect.arrayContaining(["aisha-bites", "coach-kabir", "tech-with-vihaan"]),
    );
    expect(new Set(categories)).toEqual(new Set(LAUNCH_CATEGORIES));
    expect(posts.every(({ id, content }) => (
      id.startsWith("blindly-demo-post-") && !content.startsWith("[blindly-demo:")
    ))).toBe(true);
    expect(posts.every(({ mediaUrl }) => (
      ["images.unsplash.com", "images.pexels.com"].includes(new URL(mediaUrl).hostname)
    ))).toBe(true);
    expect(posts.every(({ mediaUrl }) => (
      /^https:\/\/images\.unsplash\.com\/photo-\d+-[a-z0-9]+\?/.test(mediaUrl)
    ))).toBe(true);
    expect(new Set(posts.map(({ mediaUrl }) => mediaUrl)).size).toBe(60);
    expect(stories.every(({ id, expiresAt }) => (
      id.startsWith("blindly-demo-story-") && expiresAt > now
    ))).toBe(true);
    expect(liveSessions.every(({ id, status, scheduledAt }) => (
      id.startsWith("blindly-demo-live-") && status === "SCHEDULED" && scheduledAt > now
    ))).toBe(true);
    expect([...database.like.records.values()].every(({ userId, postId }) => (
      userId !== postsById.get(postId).creatorId
    ))).toBe(true);
    expect([...database.comment.records.values()].every(({ userId, postId }) => (
      userId !== postsById.get(postId).creatorId
    ))).toBe(true);
    expect([...database.comment.records.values()].every(({ content, postId }) => {
      const category = categoryByCreatorId.get(postsById.get(postId).creatorId);
      return content.toLowerCase().includes(category.toLowerCase());
    })).toBe(true);

    for (const user of users) {
      const creatorMedia = posts
        .filter(({ creatorId }) => creatorId === user.id)
        .map(({ mediaUrl }) => mediaUrl);
      const story = stories.find(({ userId }) => userId === user.id);
      const liveSession = liveSessions.find(({ hostId }) => hostId === user.id);

      expect(creatorMedia).toHaveLength(5);
      expect(creatorMedia).toContain(user.coverImage);
      expect(creatorMedia).toContain(story.mediaUrl);
      if (liveSession) {
        expect(creatorMedia).toContain(liveSession.thumbnailUrl);
      }
    }
  });

  it("does not duplicate importer-owned records", async () => {
    const database = createDatabase();
    const now = new Date("2026-08-05T09:00:00.000Z");

    const firstCounts = await importBlindlyDemoContent({ database, now });
    const firstSizes = Object.fromEntries(
      Object.entries(database).map(([name, table]) => [name, table.records.size]),
    );
    const secondCounts = await importBlindlyDemoContent({ database, now });

    expect(secondCounts).toEqual(firstCounts);
    expect(Object.fromEntries(
      Object.entries(database).map(([name, table]) => [name, table.records.size]),
    )).toEqual(firstSizes);
    expect(database.post.upsert).toHaveBeenCalledTimes(120);
  });

  it("preserves seeded timestamps and live lifecycle state on a later rerun", async () => {
    const database = createDatabase();
    const firstRun = new Date("2026-08-05T09:00:00.000Z");
    const laterRun = new Date("2026-08-12T17:30:00.000Z");

    await importBlindlyDemoContent({ database, now: firstRun });

    const post = [...database.post.records.values()][0];
    const story = [...database.story.records.values()][0];
    const live = [...database.liveSession.records.values()][0];
    const startedAt = new Date("2026-08-06T09:05:00.000Z");
    database.liveSession.records.set(live.id, {
      ...live,
      status: "LIVE",
      startedAt,
    });

    await importBlindlyDemoContent({ database, now: laterRun });

    expect(database.post.records.get(post.id).publishedAt).toEqual(post.publishedAt);
    expect(database.story.records.get(story.id).expiresAt).toEqual(story.expiresAt);
    expect(database.liveSession.records.get(live.id)).toMatchObject({
      scheduledAt: live.scheduledAt,
      status: "LIVE",
      startedAt,
    });
  });

  it("preserves persisted engagement aggregates on a later rerun", async () => {
    const database = createDatabase();
    await importBlindlyDemoContent({
      database,
      now: new Date("2026-08-05T09:00:00.000Z"),
    });

    const post = [...database.post.records.values()][0];
    const story = [...database.story.records.values()][0];
    const live = [...database.liveSession.records.values()][0];
    const comment = [...database.comment.records.values()][0];
    database.post.records.set(post.id, {
      ...post,
      likesCount: 41,
      commentsCount: 12,
      viewsCount: 902,
      sharesCount: 27,
    });
    database.story.records.set(story.id, { ...story, viewsCount: 88 });
    database.liveSession.records.set(live.id, {
      ...live,
      viewerCount: 64,
      maxViewers: 91,
    });
    database.comment.records.set(comment.id, { ...comment, likesCount: 7 });

    await importBlindlyDemoContent({
      database,
      now: new Date("2026-08-12T17:30:00.000Z"),
    });

    expect(database.post.records.get(post.id)).toMatchObject({
      likesCount: 41,
      commentsCount: 12,
      viewsCount: 902,
      sharesCount: 27,
    });
    expect(database.story.records.get(story.id).viewsCount).toBe(88);
    expect(database.liveSession.records.get(live.id)).toMatchObject({
      viewerCount: 64,
      maxViewers: 91,
    });
    expect(database.comment.records.get(comment.id).likesCount).toBe(7);
  });

  it("fails on importer-email collisions without altering the non-importer user", async () => {
    const database = createDatabase();
    const existingUser = {
      id: "real-user-id",
      name: "Existing account",
      email: "blindly-demo-aisha-bites@blindly.demo",
      handle: "existing-account",
      role: "USER",
    };
    database.user.records.set(existingUser.id, existingUser);

    await expect(importBlindlyDemoContent({
      database,
      now: new Date("2026-08-05T09:00:00.000Z"),
    })).rejects.toThrow("Unique constraint failed");

    expect(database.user.records.get(existingUser.id)).toEqual(existingUser);
    expect(database.creatorProfile.records.size).toBe(0);
    expect(database.post.records.size).toBe(0);
  });
});
