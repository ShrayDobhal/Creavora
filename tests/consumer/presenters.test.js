import { describe, expect, it } from "vitest";
import { presentCreator, presentPost } from "@/lib/consumer/presenters";

describe("presentPost", () => {
  it("marks premium work as unavailable in this release without paid gating", () => {
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

    const presented = presentPost(post, "u1");

    expect(presented).toMatchObject({
      content: null,
      mediaUrl: null,
      availability: "coming_soon",
      counts: { likes: 8, comments: 2, views: 20, shares: 1 },
    });
    expect(presented).not.toHaveProperty("price");
    expect(presented).not.toHaveProperty("isLocked");
  });

  it("presents a creator follower count from the live follow relation aggregate", () => {
    const creator = presentCreator(
      {
        id: "creator-1",
        name: "Asha",
        handle: "asha",
        avatar: null,
        roleTitle: "Fashion",
        verified: true,
        creatorProfile: { subscriberCount: 999 },
        _count: { followers: 17 },
        creatorFollowers: [],
      },
      "viewer-1",
    );

    expect(creator.followerCount).toBe(17);
    expect(creator).not.toHaveProperty("subscriberCount");
  });
});
