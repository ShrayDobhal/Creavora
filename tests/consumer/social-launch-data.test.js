import { describe, expect, it } from "vitest";
import { LAUNCH_CATEGORIES, LAUNCH_FEED_FIXTURES } from "../../prisma/seed.mjs";

const approvedImageHosts = new Set(["images.unsplash.com", "images.pexels.com"]);

describe("Blindly social launch feed data", () => {
  it.each(LAUNCH_CATEGORIES)("provides at least three public free posts for %s", (category) => {
    const publicPosts = LAUNCH_FEED_FIXTURES.filter(
      (post) => post.category === category && post.isPremium === false && post.price === 0,
    );

    expect(publicPosts).toHaveLength(3);
    expect(publicPosts.every((post) => post.publishedAt)).toBe(true);
  });

  it("uses approved photographic image hosts for every launch post", () => {
    for (const post of LAUNCH_FEED_FIXTURES) {
      expect(approvedImageHosts.has(new URL(post.mediaUrl).hostname)).toBe(true);
    }
  });

  it("keeps source launch post copy free of importer namespace markers", () => {
    expect(LAUNCH_FEED_FIXTURES.map((post) => post.content).join(" ")).not.toMatch(
      /\[blindly-demo:|\(Blindly Demo\)|blindly-demo-/i,
    );
  });
});
