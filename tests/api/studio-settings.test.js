import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({ withCreatorAuth: (handler) => handler }));

import {
  createStudioSettingsGet,
  createStudioSettingsPatch,
} from "@/app/api/studio/settings/route";

const creator = { id: "creator-1", role: "CREATOR" };
const saved = {
  id: creator.id,
  name: "Asha Rao",
  bio: "Textile artist",
  creatorProfile: { category: "Art", subscriptionPrice: 499 },
};

describe("creator subscription settings API", () => {
  it("returns the persisted monthly subscription price", async () => {
    const findFirst = vi.fn().mockResolvedValue(saved);
    const response = await createStudioSettingsGet({ user: { findFirst } })(
      new Request("http://localhost/api/studio/settings"),
      { user: creator },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      name: "Asha Rao",
      bio: "Textile artist",
      category: "Art",
      subscriptionPrice: 499,
    });
  });

  it("saves profile details and a server-validated INR price", async () => {
    const update = vi.fn();
    const upsert = vi.fn();
    const transaction = {
      user: {
        findFirst: vi.fn().mockResolvedValue({ id: creator.id }),
        update,
        findUnique: vi.fn().mockResolvedValue(saved),
      },
      creatorProfile: { upsert },
    };
    const database = { $transaction: (callback) => callback(transaction) };
    const response = await createStudioSettingsPatch(database)(
      new Request("http://localhost/api/studio/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Asha Rao",
          bio: "Textile artist",
          category: "Art",
          subscriptionPrice: 499,
        }),
      }),
      { user: creator },
    );

    expect(response.status).toBe(200);
    expect(upsert).toHaveBeenCalledWith({
      where: { userId: creator.id },
      create: { userId: creator.id, category: "Art", subscriptionPrice: 499 },
      update: { category: "Art", subscriptionPrice: 499 },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: creator.id },
      data: { name: "Asha Rao", bio: "Textile artist" },
    });
  });

  it.each([-1, 100001, 49.5])("rejects an invalid subscription price %s", async (subscriptionPrice) => {
    const transaction = vi.fn();
    const response = await createStudioSettingsPatch({ $transaction: transaction })(
      new Request("http://localhost/api/studio/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Asha Rao", bio: "", category: "Art", subscriptionPrice }),
      }),
      { user: creator },
    );

    expect(response.status).toBe(400);
    expect(transaction).not.toHaveBeenCalled();
  });
});
