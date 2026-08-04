import { describe, expect, it } from "vitest";
import { presentPost } from "@/lib/consumer/presenters";

describe("presentPost", () => {
  it("locks premium media for an unsubscribed viewer without changing aggregate counts", () => {
    const post = {
      id: "p1",
      creatorId: "c1",
      content: "Members note",
      mediaUrl: "https://cdn.test/a.jpg",
      mediaType: "image",
      isPremium: true,
      price: 399,
      likesCount: 8,
      commentsCount: 2,
      viewsCount: 20,
      sharesCount: 1,
      publishedAt: new Date("2026-08-01"),
      creator: {
        id: "c1",
        name: "Asha",
        handle: "asha",
        avatar: null,
        roleTitle: "Fashion",
        verified: true,
        creatorProfile: { subscriberCount: 4 },
      },
      likes: [],
      bookmarks: [],
      creatorFollowers: [],
    };

    expect(presentPost(post, "u1", new Set())).toMatchObject({
      mediaUrl: null,
      isLocked: true,
      counts: { likes: 8, comments: 2, views: 20, shares: 1 },
    });
  });
});
