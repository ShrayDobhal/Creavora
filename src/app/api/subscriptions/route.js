import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET active subscriptions for Arjun
export async function GET() {
  try {
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
}

// POST create/renew subscription
export async function POST(req) {
  try {
    const { creatorHandle, tier, price, method } = await req.json();
    const subPrice = parseFloat(price);

    if (isNaN(subPrice) || subPrice <= 0) {
      return NextResponse.json({ error: "Invalid subscription price" }, { status: 400 });
    }

    // Get fan user (Arjun)
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    // Get creator user
    const creator = await db.user.findUnique({
      where: { handle: creatorHandle },
    });

    if (!user || !creator) {
      return NextResponse.json({ error: "User or Creator not found" }, { status: 404 });
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

      // 2. Increment creator's wallet balance (simulating payout credit)
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
          tier: tier || "Premium Monthly",
          renewsOn: renewsOnStr,
          method: method || "Wallet Balance",
        },
        create: {
          userId: user.id,
          creatorId: creator.id,
          tier: tier || "Premium Monthly",
          price: subPrice,
          renewsOn: renewsOnStr,
          method: method || "Wallet Balance",
          status: "ACTIVE",
        }
      });

      // 4. Record transaction for fan
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: subPrice,
          type: "SUBSCRIPTION",
          method: method || "Wallet Balance",
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
          message: `You are now subscribed to ${creator.name} (${tier}). Received 150 XP!`,
          type: "SYSTEM",
          read: false,
        }
      });

      // 7. Create notification for creator
      await tx.notification.create({
        data: {
          userId: creator.id,
          title: "New Premium Subscriber!",
          message: `${user.name} has subscribed to your ${tier} tier.`,
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
}
