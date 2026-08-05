import { describe, expect, it } from "vitest";
import { getFeedPage, parseFeedQuery } from "@/lib/consumer/feed";
import { makeTransactionFixture } from "../helpers/make-transaction-fixture";

describe("feed services", () => {
  it("rejects an unsupported feed mode", () => {
    expect(() => parseFeedQuery(new URLSearchParams("mode=nearby"))).toThrow(
      "Unsupported feed mode",
    );
  });

  it("rejects limits outside the supported page range", () => {
    expect(() => parseFeedQuery(new URLSearchParams("limit=31"))).toThrow(
      "Invalid feed limit",
    );
  });

  it("returns a cursor containing the final page item's published time and id", async () => {
    const publishedAt = new Date("2026-08-01T10:00:00.000Z");
    const fixture = makeTransactionFixture({
      posts: ["post-c", "post-b", "post-a"].map((id) => ({
        ...makeTransactionFixture().posts[0],
        id,
        publishedAt,
      })),
    });

    const page = await getFeedPage(fixture.db, "viewer-1", {
      mode: "latest",
      limit: 2,
      cursor: null,
    });

    expect(page.items.map((item) => item.id)).toEqual(["post-c", "post-b"]);
    expect(JSON.parse(Buffer.from(page.nextCursor, "base64url").toString())).toEqual({
      mode: "latest",
      publishedAt: "2026-08-01T10:00:00.000Z",
      id: "post-b",
    });
  });

  it("uses both cursor fields to fetch the next descending page", async () => {
    const fixture = makeTransactionFixture();
    const cursor = Buffer.from(
      JSON.stringify({
        mode: "latest",
        publishedAt: "2026-08-01T10:00:00.000Z",
        id: "post-b",
      }),
    ).toString("base64url");

    await getFeedPage(fixture.db, "viewer-1", {
      mode: "latest",
      limit: 2,
      cursor,
    });

    expect(fixture.calls.postFindMany[0]).toMatchObject({
      take: 3,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      where: {
        deletedAt: null,
        publishedAt: { lte: expect.any(Date) },
        AND: [
          {
            OR: [
              { publishedAt: { lt: new Date("2026-08-01T10:00:00.000Z") } },
              {
                publishedAt: new Date("2026-08-01T10:00:00.000Z"),
                id: { lt: "post-b" },
              },
            ],
          },
        ],
      },
    });
  });

  it("limits following mode to creators followed by the viewer", async () => {
    const fixture = makeTransactionFixture({
      follows: [{ id: "follow-1", followerId: "viewer-1", followingId: "creator-1" }],
    });

    await getFeedPage(fixture.db, "viewer-1", {
      mode: "following",
      limit: 12,
      cursor: null,
    });

    expect(fixture.calls.postFindMany[0].where.creatorId).toEqual({ in: ["creator-1"] });
  });

  it("excludes posts from soft-deleted creators", async () => {
    const fixture = makeTransactionFixture();

    await getFeedPage(fixture.db, "viewer-1", {
      mode: "latest",
      limit: 12,
      cursor: null,
    });

    expect(fixture.calls.postFindMany[0].where.creator).toEqual({
      is: { deletedAt: null },
    });
  });

  it("orders trending posts by engagement before publication time and id", async () => {
    const fixture = makeTransactionFixture();

    await getFeedPage(fixture.db, "viewer-1", {
      mode: "trending",
      limit: 4,
      cursor: null,
    });

    expect(fixture.calls.postFindMany[0].orderBy).toEqual([
      { likesCount: "desc" },
      { commentsCount: "desc" },
      { publishedAt: "desc" },
      { id: "desc" },
    ]);
  });

  it("encodes every trending sort field and mode in its cursor", async () => {
    const publishedAt = new Date("2026-08-01T10:00:00.000Z");
    const fixture = makeTransactionFixture({
      posts: [
        {
          ...makeTransactionFixture().posts[0],
          id: "post-high",
          likesCount: 9,
          commentsCount: 4,
          publishedAt,
        },
        {
          ...makeTransactionFixture().posts[0],
          id: "post-cursor",
          likesCount: 7,
          commentsCount: 3,
          publishedAt,
        },
      ],
    });

    const page = await getFeedPage(fixture.db, "viewer-1", {
      mode: "trending",
      limit: 1,
      cursor: null,
    });

    expect(JSON.parse(Buffer.from(page.nextCursor, "base64url").toString())).toEqual({
      mode: "trending",
      likesCount: 9,
      commentsCount: 4,
      publishedAt: "2026-08-01T10:00:00.000Z",
      id: "post-high",
    });
  });

  it("uses every trending cursor field to fetch the next descending page", async () => {
    const fixture = makeTransactionFixture();
    const cursor = Buffer.from(
      JSON.stringify({
        mode: "trending",
        likesCount: 9,
        commentsCount: 4,
        publishedAt: "2026-08-01T10:00:00.000Z",
        id: "post-b",
      }),
    ).toString("base64url");

    await getFeedPage(fixture.db, "viewer-1", {
      mode: "trending",
      limit: 4,
      cursor,
    });

    expect(fixture.calls.postFindMany[0].where.AND).toEqual([
      {
        OR: [
          { likesCount: { lt: 9 } },
          { likesCount: 9, commentsCount: { lt: 4 } },
          {
            likesCount: 9,
            commentsCount: 4,
            publishedAt: { lt: new Date("2026-08-01T10:00:00.000Z") },
          },
          {
            likesCount: 9,
            commentsCount: 4,
            publishedAt: new Date("2026-08-01T10:00:00.000Z"),
            id: { lt: "post-b" },
          },
        ],
      },
    ]);
  });

  it("rejects a cursor created for a different feed mode", async () => {
    const fixture = makeTransactionFixture({
      posts: [
        makeTransactionFixture().posts[0],
        { ...makeTransactionFixture().posts[0], id: "post-2" },
      ],
    });
    const trendingPage = await getFeedPage(fixture.db, "viewer-1", {
      mode: "trending",
      limit: 1,
      cursor: null,
    });

    await expect(
      getFeedPage(fixture.db, "viewer-1", {
        mode: "latest",
        limit: 1,
        cursor: trendingPage.nextCursor,
      }),
    ).rejects.toThrow("Invalid feed cursor");
  });

  it("rejects a trending cursor with a non-string publication time", async () => {
    const fixture = makeTransactionFixture();
    const cursor = Buffer.from(
      JSON.stringify({
        mode: "trending",
        likesCount: 9,
        commentsCount: 4,
        publishedAt: null,
        id: "post-b",
      }),
    ).toString("base64url");

    await expect(
      getFeedPage(fixture.db, "viewer-1", {
        mode: "trending",
        limit: 4,
        cursor,
      }),
    ).rejects.toThrow("Invalid feed cursor");
    expect(fixture.calls.postFindMany).toHaveLength(0);
  });
});
