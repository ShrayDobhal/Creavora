import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { creatorName } = await req.json();

    // Get fan user (Arjun)
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    // Get creator user
    const creator = await db.user.findFirst({
      where: { name: creatorName },
    });

    if (!user || !creator) {
      return NextResponse.json({ error: "User or Creator not found" }, { status: 404 });
    }

    // Cancel the subscription
    const updatedSub = await db.subscription.update({
      where: {
        userId_creatorId: {
          userId: user.id,
          creatorId: creator.id,
        }
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        creator: true,
      }
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Subscription Cancelled",
        message: `Your subscription to ${creator.name} has been cancelled. It will remain active until ${updatedSub.renewsOn}.`,
        type: "SYSTEM",
        read: false,
      }
    });

    return NextResponse.json(updatedSub);
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
