import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({ withAuth: (handler) => handler }));

import {
  createProfileGet,
  createProfilePatch,
} from "@/app/api/profile/route";

const jsonRequest = (method, body) =>
  new Request("http://localhost/api/profile", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const profileRow = {
  id: "user-1",
  name: "Neha Rao",
  email: "neha@example.test",
  handle: "neha-runs",
  bio: "Running coach",
  avatar: "https://cdn.example.test/neha.jpg",
  coverImage: "https://cdn.example.test/neha-cover.jpg",
  roleTitle: "Running Coach",
  location: "Bengaluru",
  website: "https://neha.example.test",
  profileVisibility: "PUBLIC",
  deletedAt: null,
  _count: { followers: 12, following: 8, posts: 4 },
};

describe("Blindly social launch profile API", () => {
  it("returns persisted profile fields and real social counts", async () => {
    const response = await createProfileGet({ user: { findUnique: vi.fn().mockResolvedValue(profileRow) } })(
      new Request("http://localhost/api/profile"), { user: { id: "user-1" } },
    );
    expect(await response.json()).toMatchObject({
      handle: "neha-runs", location: "Bengaluru", counts: { followers: 12, following: 8, posts: 4 },
    });
  });

  it("rejects a profile update with an invalid website before calling Prisma", async () => {
    const update = vi.fn();
    const response = await createProfilePatch({ user: { update } })(
      jsonRequest("PATCH", { website: "not a url" }), { user: { id: "user-1" } },
    );
    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns a stable not-found response when the profile is soft-deleted", async () => {
    const response = await createProfileGet({
      user: { findUnique: vi.fn().mockResolvedValue({ ...profileRow, deletedAt: new Date() }) },
    })(new Request("http://localhost/api/profile"), { user: { id: "user-1" } });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Profile not found" });
  });

  it("clears an avatar and returns the updated profile payload", async () => {
    const response = await createProfilePatch({
      user: {
        findUnique: vi.fn().mockResolvedValue(profileRow),
        update: vi.fn().mockResolvedValue({ ...profileRow, avatar: null }),
      },
      mediaAsset: { findFirst: vi.fn() },
    })(jsonRequest("PATCH", { avatar: null }), { user: { id: "user-1" } });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ avatar: null, counts: { posts: 4 } });
  });
});
