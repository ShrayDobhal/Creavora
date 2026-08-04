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
      publishedAt: "2026-08-01T10:00:00.000Z",
      id: "post-b",
    });
  });

  it("uses both cursor fields to fetch the next descending page", async () => {
    const fixture = makeTransactionFixture();
    const cursor = Buffer.from(
      JSON.stringify({ publishedAt: "2026-08-01T10:00:00.000Z", id: "post-b" }),
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
});
