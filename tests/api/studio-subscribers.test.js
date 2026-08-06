import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({
  withAuth: (handler) => handler,
  withCreatorAuth: (handler) => handler,
}));

import { createMessagesGet } from "@/app/api/messages/route";
import { createStudioSubscribersGet } from "@/app/api/studio/subscribers/route";

const creator = { id: "creator-1", role: "CREATOR" };
const subscriber = {
  id: "fan-1",
  name: "Riya Shah",
  handle: "riya",
  avatar: null,
  roleTitle: null,
  verified: false,
};

describe("creator subscriber data", () => {
  it("loads memberships owned by the logged-in creator", async () => {
    const findMany = vi.fn().mockResolvedValue([{
      id: "subscription-1",
      tier: "Community access",
      price: 0,
      status: "ACTIVE",
      renewsOn: "No renewal",
      user: subscriber,
    }]);
    const response = await createStudioSubscribersGet({ subscription: { findMany } })(
      new Request("http://localhost/api/studio/subscribers"),
      { user: creator },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ items: [{ id: "subscription-1", user: { id: "fan-1" } }] });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ creatorId: creator.id }),
      take: 100,
    }));
  });

  it("offers active subscribers as real creator conversation starters", async () => {
    const findSubscribers = vi.fn().mockResolvedValue([{ user: subscriber }]);
    const response = await createMessagesGet({ database: {
      message: { findMany: vi.fn().mockResolvedValue([]) },
      subscription: { findMany: findSubscribers },
    } })(new Request("http://localhost/api/messages"), { user: creator });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [], suggestions: [subscriber] });
    expect(findSubscribers).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ creatorId: creator.id, status: "ACTIVE" }),
    }));
  });
});
