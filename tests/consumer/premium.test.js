import { describe, expect, it, vi } from "vitest";
import { resolvePremiumAvailability } from "@/lib/consumer/premium";

const premiumPost = (id, creatorId, publishedAt) => ({ id, creatorId, isPremium: true, publishedAt });

describe("resolvePremiumAvailability", () => {
  it("allows only the newest two premium posts as free previews", async () => {
    const posts = [
      premiumPost("post-3", "creator-1", new Date("2026-08-03")),
      premiumPost("post-2", "creator-1", new Date("2026-08-02")),
      premiumPost("post-1", "creator-1", new Date("2026-08-01")),
    ];
    const database = {
      subscription: { findMany: vi.fn().mockResolvedValue([]) },
      post: { findMany: vi.fn().mockResolvedValue([{ id: "post-3" }, { id: "post-2" }]) },
    };

    const result = await resolvePremiumAvailability(database, "viewer-1", posts);

    expect(result.get("post-3")).toEqual({ availability: "preview", previewIndex: 1 });
    expect(result.get("post-2")).toEqual({ availability: "preview", previewIndex: 2 });
    expect(result.get("post-1")).toEqual({ availability: "locked", previewIndex: null });
  });

  it("unlocks every post for an active subscriber", async () => {
    const posts = [premiumPost("post-1", "creator-1", new Date("2026-08-01"))];
    const database = {
      subscription: { findMany: vi.fn().mockResolvedValue([{ creatorId: "creator-1" }]) },
      post: { findMany: vi.fn().mockResolvedValue([{ id: "post-1" }]) },
    };

    const result = await resolvePremiumAvailability(database, "viewer-1", posts);
    expect(result.get("post-1")).toEqual({ availability: "available", previewIndex: null });
  });
});
