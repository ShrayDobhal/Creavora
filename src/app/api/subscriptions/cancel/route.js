import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createCancelSubscriptionPost({ database = db } = {}) {
  return async (req, { user }) => {
    try {
      const body = await req.json();
      const subscriptionId = typeof body?.subscriptionId === "string" ? body.subscriptionId.trim() : "";
      if (!subscriptionId) {
        return NextResponse.json({ error: "Subscription is required" }, { status: 400 });
      }

      const where = { id: subscriptionId, userId: user.id, status: "ACTIVE" };
      const existing = await database.subscription.findFirst({
        where,
        select: { id: true, status: true },
      });
      if (!existing || existing.status !== "ACTIVE") {
        return NextResponse.json({ error: "Active subscription not found" }, { status: 404 });
      }

      const subscription = await database.subscription.update({
        where,
        data: { status: "CANCELLED", cancelledAt: new Date() },
        select: {
          id: true,
          userId: true,
          creatorId: true,
          tier: true,
          price: true,
          method: true,
          status: true,
          renewsOn: true,
          cancelledAt: true,
          creator: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              roleTitle: true,
              verified: true,
            },
          },
        },
      });
      return NextResponse.json({ subscription });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to cancel subscription");
    }
  };
}

export const POST = withAuth(createCancelSubscriptionPost());
