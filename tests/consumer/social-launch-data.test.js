import { describe, expect, it, vi } from "vitest";
import { LAUNCH_CATEGORIES, LAUNCH_FEED_FIXTURES } from "../../prisma/seed.mjs";
import { getCurrentProfile, updateCurrentProfile } from "@/lib/consumer/profile";
import { presentCreator } from "@/lib/consumer/presenters";

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

  it("returns an address only from the authenticated profile", async () => {
    const creatorRow = {
      id: "user-1",
      name: "Nisha Kapoor",
      email: "nisha@example.test",
      handle: "nisha-kapoor",
      bio: null,
      avatar: null,
      coverImage: null,
      roleTitle: "Photographer",
      location: "Mumbai, Maharashtra",
      address: "Bandra West, Mumbai 400050",
      website: null,
      profileVisibility: "PUBLIC",
      deletedAt: null,
      _count: { followers: 0, following: 0, posts: 0 },
    };
    const database = {
      user: {
        findFirst: vi.fn().mockResolvedValue(creatorRow),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    expect(await getCurrentProfile(database, "user-1")).toMatchObject({
      location: "Mumbai, Maharashtra",
      address: "Bandra West, Mumbai 400050",
    });

    await updateCurrentProfile(database, "user-1", { address: "Indiranagar, Bengaluru 560038" });
    expect(database.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { address: "Indiranagar, Bengaluru 560038" },
    }));
    expect(presentCreator({ ...creatorRow, address: "private" }, "viewer-1")).not.toHaveProperty("address");
  });

  it("normalizes an empty address to null for direct profile-service callers", async () => {
    const profile = {
      id: "user-1",
      name: "Nisha Kapoor",
      email: "nisha@example.test",
      handle: "nisha-kapoor",
      address: null,
      _count: { followers: 0, following: 0, posts: 0 },
    };
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = {
      user: {
        findFirst: vi.fn().mockResolvedValue(profile),
        updateMany,
      },
    };

    await updateCurrentProfile(database, "user-1", { address: "" });

    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { address: null },
    }));
  });

  it("keeps source launch post copy free of importer namespace markers", () => {
    expect(LAUNCH_FEED_FIXTURES.map((post) => post.content).join(" ")).not.toMatch(
      /\[blindly-demo:|\(Blindly Demo\)|blindly-demo-/i,
    );
  });
});
