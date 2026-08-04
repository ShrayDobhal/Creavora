import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { createSubscriptionSchema, validateBody } from "@/lib/validators";

// GET active subscriptions for authenticated user
export const GET = withAuth(async (req, { user }) => {
  try {
    const subscriptions = await db.subscription.findMany({
      where: {
        userId: user.id,
      },
      include: {
        creator: true,
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("GET Subscriptions Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

// POST create/renew subscription
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    
    // Support legacy payloads that send creatorHandle
    let creatorId = body.creatorId;
    if (!creatorId && body.creatorHandle) {
      const creatorUser = await db.user.findUnique({
        where: { handle: body.creatorHandle }
      });
      if (creatorUser) {
        creatorId = creatorUser.id;
      }
    }

    const { error, data } = validateBody(createSubscriptionSchema, {
      creatorId,
      tier: body.tier,
      price: parseFloat(body.price),
      method: body.method || "Wallet Balance",
    });

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    const subPrice = data.price;

    // Get creator user
    const creator = await db.user.findUnique({
      where: { id: data.creatorId, deletedAt: null },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (user.walletBalance < subPrice) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. You need ₹${subPrice.toFixed(2)} but only have ₹${user.walletBalance.toFixed(2)}.` },
        { status: 402 }
      );
    }

    // Process subscription purchase
    const result = await db.$transaction(async (tx) => {
      // 1. Decrement user wallet balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: {
            decrement: subPrice,
          },
          xp: {
            increment: 150, // Get 150 XP for subscribing!
          }
        },
      });

      // 2. Increment creator's wallet balance
      await tx.user.update({
        where: { id: creator.id },
        data: {
          walletBalance: {
            increment: subPrice,
          }
        }
      });

      // 3. Upsert subscription record
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);
      const renewsOnStr = renewalDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

      const subscription = await tx.subscription.upsert({
        where: {
          userId_creatorId: {
            userId: user.id,
            creatorId: creator.id,
          }
        },
        update: {
          status: "ACTIVE",
          price: subPrice,
          tier: data.tier,
          renewsOn: renewsOnStr,
          method: data.method,
        },
        create: {
          userId: user.id,
          creatorId: creator.id,
          tier: data.tier,
          price: subPrice,
          renewsOn: renewsOnStr,
          method: data.method,
          status: "ACTIVE",
        }
      });

      // 4. Record transaction for fan
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: subPrice,
          type: "SUBSCRIPTION",
          method: data.method,
          reference: `SUB${Math.floor(100000 + Math.random() * 900000)}`,
          status: "COMPLETED",
        }
      });

      // 5. Record transaction for creator
      await tx.transaction.create({
        data: {
          userId: creator.id,
          amount: subPrice,
          type: "EARNING",
          method: "Fan Subscription",
          reference: `EARN${Math.floor(100000 + Math.random() * 900000)}`,
          status: "COMPLETED",
        }
      });

      // 6. Create notification for fan
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Subscribed Successfully",
          message: `You are now subscribed to ${creator.name} (${data.tier}). Received 150 XP!`,
          type: "SYSTEM",
          read: false,
        }
      });

      // 7. Create notification for creator
      await tx.notification.create({
        data: {
          userId: creator.id,
          title: "New Premium Subscriber!",
          message: `${user.name} has subscribed to your ${data.tier} tier.`,
          type: "SYSTEM",
          read: false,
        }
      });

      return subscription;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Purchase Subscription Error:", error);
    return NextResponse.json({ error: "Purchase transaction failed" }, { status: 500 });
  }
});
