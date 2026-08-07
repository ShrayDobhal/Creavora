import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({ withCreatorAuth: (handler) => handler }));

import { createStudioPostsGet } from "@/app/api/studio/posts/route";
import { createStudioEarningsGet, createStudioPayoutPost } from "@/app/api/studio/earnings/route";

const creator = { id: "creator-1", role: "CREATOR" };

describe("real creator studio data", () => {
  it("loads only the signed-in creator's persisted posts", async () => {
    const rows = [{ id: "post-1", content: "My actual post", likesCount: 4 }];
    const findMany = vi.fn().mockResolvedValue(rows);
    const response = await createStudioPostsGet({ post: { findMany } })(
      new Request("http://localhost/api/studio/posts"),
      { user: creator },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: rows });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { creatorId: creator.id, deletedAt: null },
    }));
  });

  it("calculates dated earnings and analytics from persisted records", async () => {
    const current = new Date("2026-08-05T10:00:00.000Z");
    const previous = new Date("2026-07-20T10:00:00.000Z");
    const earnings = [
      { id: "earning-1", amount: 499, type: "EARNING", method: "SUBSCRIPTION", reference: "pay-1", status: "COMPLETED", createdAt: current },
      { id: "earning-2", amount: 250, type: "EARNING", method: "TIP", reference: "pay-2", status: "COMPLETED", createdAt: previous },
    ];
    const database = {
      creatorProfile: { findUnique: vi.fn().mockResolvedValue({ totalEarnings: 900, availableBalance: 749, payoutMethod: "UPI", payoutDetails: "creator@upi" }) },
      transaction: { findMany: vi.fn().mockResolvedValueOnce(earnings).mockResolvedValueOnce(earnings.slice().reverse()) },
      withdrawalRequest: { findMany: vi.fn().mockResolvedValue([]) },
      post: { aggregate: vi.fn().mockResolvedValue({ _count: { _all: 3 }, _sum: { viewsCount: 100, likesCount: 20, commentsCount: 7, sharesCount: 2 } }) },
      subscription: { count: vi.fn().mockResolvedValue(5) },
    };
    const response = await createStudioEarningsGet(database, () => new Date("2026-08-07T12:00:00.000Z"))(
      new Request("http://localhost/api/studio/earnings"),
      { user: creator },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.earnings).toMatchObject({ total: 900, thisMonth: 499, lastMonth: 250 });
    expect(body.earnings.series).toHaveLength(30);
    expect(body.analytics).toEqual({ posts: 3, views: 100, likes: 20, comments: 7, shares: 2, activeSubscribers: 5 });
    expect(body.payoutAccount).toEqual({ method: "UPI", details: "creator@upi", availableBalance: 749 });
  });

  it("requests the exact available balance using the saved payout destination", async () => {
    const transaction = {
      creatorProfile: {
        findUnique: vi.fn().mockResolvedValue({ availableBalance: 749, payoutMethod: "UPI", payoutDetails: "creator@upi" }),
        update: vi.fn().mockResolvedValue({}),
      },
      withdrawalRequest: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "withdrawal-1", amount: 749, status: "PENDING" }),
      },
      transaction: { create: vi.fn().mockResolvedValue({}) },
      notification: { create: vi.fn().mockResolvedValue({}) },
    };
    const database = { $transaction: vi.fn((callback) => callback(transaction)) };
    const response = await createStudioPayoutPost(database)(
      new Request("http://localhost/api/studio/earnings", { method: "POST" }),
      { user: creator },
    );

    expect(response.status).toBe(201);
    expect(transaction.withdrawalRequest.create).toHaveBeenCalledWith({ data: {
      userId: creator.id,
      amount: 749,
      method: "UPI",
      accountDetails: "creator@upi",
    } });
    expect(transaction.creatorProfile.update).toHaveBeenCalledWith({
      where: { userId: creator.id },
      data: { availableBalance: { decrement: 749 } },
    });
  });
});
