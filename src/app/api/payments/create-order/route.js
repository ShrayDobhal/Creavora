import { randomUUID } from "node:crypto";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

const orderSchema = z.object({
  creatorId: z.string().trim().min(1).max(191),
}).strict();

const paymentConfiguration = (env) => {
  const keyId = env.RAZORPAY_KEY_ID?.trim();
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim();
  return keyId && keySecret ? { keyId, keySecret } : null;
};

export function createPaymentOrderHandler({
  database = db,
  env = process.env,
  createGateway = ({ keyId, keySecret }) => new Razorpay({ key_id: keyId, key_secret: keySecret }),
} = {}) {
  return async (request, { user }) => {
    const parsed = orderSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Choose a valid creator plan" }, { status: 400 });

    const configuration = paymentConfiguration(env);
    if (!configuration) {
      return NextResponse.json({ error: "Razorpay is not configured yet" }, { status: 503 });
    }

    try {
      const creator = await database.user.findFirst({
        where: { id: parsed.data.creatorId, role: "CREATOR", deletedAt: null, banned: false },
        select: {
          id: true,
          name: true,
          handle: true,
          avatar: true,
          creatorProfile: { select: { subscriptionPrice: true } },
        },
      });
      if (!creator) return NextResponse.json({ error: "Creator plan not found" }, { status: 404 });
      if (creator.id === user.id) return NextResponse.json({ error: "You cannot subscribe to your own plan" }, { status: 400 });

      const price = Number(creator.creatorProfile?.subscriptionPrice || 0);
      if (!Number.isInteger(price) || price < 1 || price > 500000) {
        return NextResponse.json({ error: "This creator has not published a paid plan" }, { status: 409 });
      }

      const currentSubscription = await database.subscription.findUnique({
        where: { userId_creatorId: { userId: user.id, creatorId: creator.id } },
        select: { status: true },
      });
      if (currentSubscription?.status === "ACTIVE") {
        return NextResponse.json({ error: "You already have access to this creator" }, { status: 409 });
      }

      const amount = price * 100;
      const gateway = createGateway(configuration);
      const order = await gateway.orders.create({
        amount,
        currency: "INR",
        receipt: `blindly_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
        notes: { creatorId: creator.id, userId: user.id, purpose: "creator_subscription" },
      });

      await database.payment.create({
        data: {
          userId: user.id,
          orderId: order.id,
          amount: price,
          currency: "INR",
          status: "CREATED",
          provider: "RAZORPAY",
          metadata: JSON.stringify({ creatorId: creator.id, creatorHandle: creator.handle, purpose: "creator_subscription" }),
        },
      });

      return NextResponse.json({
        keyId: configuration.keyId,
        orderId: order.id,
        amount,
        currency: "INR",
        creator: { id: creator.id, name: creator.name, handle: creator.handle, avatar: creator.avatar, price },
        customer: { name: user.name, email: user.email },
      }, { status: 201 });
    } catch (error) {
      console.error("Razorpay order creation failed", { userId: user.id, message: error?.message });
      return NextResponse.json({ error: "Unable to start Razorpay checkout" }, { status: 502 });
    }
  };
}

export const POST = withAuth(createPaymentOrderHandler());
