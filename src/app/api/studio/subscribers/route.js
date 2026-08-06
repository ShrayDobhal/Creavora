import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCreatorAuth } from "@/lib/middleware";
import { consumerErrorResponse } from "@/lib/consumer/http";

const subscriberSelect = {
  id: true,
  tier: true,
  price: true,
  method: true,
  renewsOn: true,
  status: true,
  cancelledAt: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      handle: true,
      avatar: true,
      roleTitle: true,
      verified: true,
    },
  },
};

export function createStudioSubscribersGet(database = db) {
  return async (_req, { user }) => {
    try {
      const items = await database.subscription.findMany({
        where: {
          creatorId: user.id,
          user: { is: { deletedAt: null, banned: false } },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 100,
        select: subscriberSelect,
      });

      return NextResponse.json({ items });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load subscribers");
    }
  };
}

export const GET = withCreatorAuth(createStudioSubscribersGet());
