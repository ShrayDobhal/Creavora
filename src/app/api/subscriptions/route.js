import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createSubscriptionsGet({ database = db } = {}) {
  return async (_req, { user }) => {
    try {
      const recommendationsQuery = database.user?.findMany
        ? database.user.findMany({
            where: {
              id: { not: user.id },
              role: "CREATOR",
              deletedAt: null,
              banned: false,
              creatorSubs: { none: { userId: user.id } },
            },
            orderBy: { createdAt: "desc" },
            take: 12,
            select: {
              id: true,
              name: true,
              handle: true,
              avatar: true,
              roleTitle: true,
              verified: true,
              creatorProfile: { select: { category: true, subscriptionPrice: true } },
              _count: { select: { followers: true } },
            },
          })
        : Promise.resolve([]);
      const [subscriptions, recommendations] = await Promise.all([
        database.subscription.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          tier: true,
          price: true,
          method: true,
          renewsOn: true,
          status: true,
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
        }),
        recommendationsQuery,
      ]);
      return NextResponse.json({
        items: subscriptions,
        recommendations: recommendations.map((creator) => ({
          id: creator.id,
          name: creator.name,
          handle: creator.handle,
          avatar: creator.avatar ?? null,
          roleTitle: creator.roleTitle ?? null,
          verified: Boolean(creator.verified),
          category: creator.creatorProfile?.category ?? null,
          subscriptionPrice: creator.creatorProfile?.subscriptionPrice ?? 0,
          followerCount: typeof creator._count?.followers === "number"
            ? creator._count.followers
            : null,
        })),
      });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load subscriptions");
    }
  };
}

const freeSubscriptionValues = {
  tier: "Community access",
  price: 0,
  method: "FREE",
  status: "ACTIVE",
  renewsOn: "No renewal",
  cancelledAt: null,
};

const isFreeCommunitySubscription = (subscription) => (
  subscription?.tier === freeSubscriptionValues.tier
  && Number(subscription.price) === freeSubscriptionValues.price
  && subscription.method === freeSubscriptionValues.method
);

const subscriptionSelect = {
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
};

export function createSubscriptionPost({ database = db } = {}) {
  return async (req, { user }) => {
    let creatorId = "";
    try {
      const body = await req.json();
      creatorId = typeof body?.creatorId === "string" ? body.creatorId.trim() : "";
      if (!creatorId) {
        return NextResponse.json({ error: "Creator is required" }, { status: 400 });
      }
      if (creatorId === user.id) {
        return NextResponse.json({ error: "You cannot subscribe to yourself" }, { status: 400 });
      }

      const result = await database.$transaction(async (transaction) => {
        const creator = await transaction.user.findFirst({
          where: { id: creatorId, role: "CREATOR", deletedAt: null, banned: false },
          select: { id: true, creatorProfile: { select: { subscriptionPrice: true } } },
        });
        if (!creator) return null;
        if ((creator.creatorProfile?.subscriptionPrice ?? 0) > 0) {
          return { paidPlan: true, price: creator.creatorProfile.subscriptionPrice };
        }

        const existing = await transaction.subscription.findUnique({
          where: { userId_creatorId: { userId: user.id, creatorId } },
          select: subscriptionSelect,
        });
        if (!existing) {
          const subscription = await transaction.subscription.create({
            data: { userId: user.id, creatorId, ...freeSubscriptionValues },
            select: subscriptionSelect,
          });
          return { subscription, created: true };
        }

        if (!isFreeCommunitySubscription(existing)) return { conflict: true };
        if (existing.status === "ACTIVE") return { subscription: existing, created: false };

        const subscription = await transaction.subscription.update({
          where: { id: existing.id, userId: user.id },
          data: { status: "ACTIVE", renewsOn: "No renewal", cancelledAt: null },
          select: subscriptionSelect,
        });
        return { subscription, created: false };
      });

      if (!result) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
      if (result.paidPlan) {
        return NextResponse.json(
          { error: "Paid checkout is required for this creator", code: "PAID_CHECKOUT_REQUIRED", price: result.price },
          { status: 409 },
        );
      }
      if (result.conflict) {
        return NextResponse.json(
          { error: "A recorded subscription already exists for this creator" },
          { status: 409 },
        );
      }
      return NextResponse.json(result, { status: result.created ? 201 : 200 });
    } catch (error) {
      if (error?.code === "P2002" && creatorId) {
        try {
          const winner = await database.subscription.findUnique({
            where: { userId_creatorId: { userId: user.id, creatorId } },
            select: subscriptionSelect,
          });
          if (winner && isFreeCommunitySubscription(winner)) {
            return NextResponse.json({ subscription: winner, created: false });
          }
          if (winner) {
            return NextResponse.json(
              { error: "A recorded subscription already exists for this creator" },
              { status: 409 },
            );
          }
        } catch (refetchError) {
          return consumerErrorResponse(refetchError, "Failed to create subscription");
        }
      }
      return consumerErrorResponse(error, "Failed to create subscription");
    }
  };
}

export const GET = withAuth(createSubscriptionsGet());
export const POST = withAuth(createSubscriptionPost());
