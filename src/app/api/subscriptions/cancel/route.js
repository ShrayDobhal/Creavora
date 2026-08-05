import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createCancelSubscriptionPost({ database = db } = {}) {
  return async (req, { user }) => {
    try {
      const body = await req.json();
      const creatorId = typeof body?.creatorId === "string" ? body.creatorId.trim() : "";
      if (!creatorId) {
        return NextResponse.json({ error: "Creator is required" }, { status: 400 });
      }

      const where = { userId_creatorId: { userId: user.id, creatorId } };
      const existing = await database.subscription.findUnique({
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
