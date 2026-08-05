import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createSubscriptionsGet({ database = db } = {}) {
  return async (_req, { user }) => {
    try {
      const subscriptions = await database.subscription.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          tier: true,
          renewsOn: true,
          status: true,
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
      return NextResponse.json({ items: subscriptions });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load subscriptions");
    }
  };
}

export function createSubscriptionPost() {
  return async () =>
    NextResponse.json(
      { error: "This feature is not available yet" },
      { status: 501 },
    );
}

export const GET = withAuth(createSubscriptionsGet());
export const POST = withAuth(createSubscriptionPost());
