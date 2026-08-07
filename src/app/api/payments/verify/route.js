import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

const verificationSchema = z.object({
  razorpayOrderId: z.string().trim().min(1).max(191),
  razorpayPaymentId: z.string().trim().min(1).max(191),
  razorpaySignature: z.string().trim().regex(/^[a-f0-9]{64}$/i),
}).strict();

const safeMetadata = (value) => {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const signatureMatches = ({ orderId, paymentId, signature, secret }) => {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
};

const nextRenewal = () => {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString();
};

export function createPaymentVerificationHandler({
  database = db,
  env = process.env,
  createGateway = ({ keyId, keySecret }) => new Razorpay({ key_id: keyId, key_secret: keySecret }),
} = {}) {
  return async (request, { user }) => {
    const parsed = verificationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid payment confirmation" }, { status: 400 });

    const keyId = env.RAZORPAY_KEY_ID?.trim();
    const keySecret = env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) return NextResponse.json({ error: "Razorpay is not configured yet" }, { status: 503 });

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;
    if (!signatureMatches({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature, secret: keySecret })) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    try {
      const payment = await database.payment.findFirst({
        where: { orderId: razorpayOrderId, userId: user.id, provider: "RAZORPAY" },
      });
      if (!payment) return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
      const metadata = safeMetadata(payment.metadata);
      if (typeof metadata.creatorId !== "string") return NextResponse.json({ error: "Payment order is incomplete" }, { status: 409 });

      const remotePayment = await createGateway({ keyId, keySecret }).payments.fetch(razorpayPaymentId);
      const expectedAmount = Math.round(payment.amount * 100);
      if (
        remotePayment.order_id !== razorpayOrderId
        || Number(remotePayment.amount) !== expectedAmount
        || remotePayment.currency !== "INR"
        || remotePayment.status !== "captured"
      ) {
        return NextResponse.json({ error: "Payment has not been captured yet" }, { status: 409 });
      }

      const result = await database.$transaction(async (transaction) => {
        const claim = await transaction.payment.updateMany({
          where: { id: payment.id, status: { not: "CAPTURED" } },
          data: { status: "CAPTURED", paymentId: razorpayPaymentId },
        });
        if (claim.count === 0) {
          const subscription = await transaction.subscription.findUnique({
            where: { userId_creatorId: { userId: user.id, creatorId: metadata.creatorId } },
          });
          return { subscription, alreadyVerified: true };
        }

        const existing = await transaction.subscription.findUnique({
          where: { userId_creatorId: { userId: user.id, creatorId: metadata.creatorId } },
          select: { status: true },
        });
        const wasActive = existing?.status === "ACTIVE";
        const method = String(remotePayment.method || "RAZORPAY").toUpperCase();
        const subscription = await transaction.subscription.upsert({
          where: { userId_creatorId: { userId: user.id, creatorId: metadata.creatorId } },
          create: {
            userId: user.id,
            creatorId: metadata.creatorId,
            tier: "Premium Monthly",
            price: payment.amount,
            renewsOn: nextRenewal(),
            method,
            status: "ACTIVE",
          },
          update: {
            tier: "Premium Monthly",
            price: payment.amount,
            renewsOn: nextRenewal(),
            method,
            status: "ACTIVE",
            cancelledAt: null,
          },
        });
        await transaction.transaction.create({
          data: {
            userId: user.id,
            amount: payment.amount,
            type: "SUBSCRIPTION",
            method,
            reference: razorpayPaymentId,
            status: "COMPLETED",
            metadata: JSON.stringify({ creatorId: metadata.creatorId, orderId: razorpayOrderId, paymentId: payment.id }),
          },
        });
        await transaction.transaction.create({
          data: {
            userId: metadata.creatorId,
            amount: payment.amount,
            type: "EARNING",
            method: "SUBSCRIPTION",
            reference: razorpayPaymentId,
            status: "COMPLETED",
            metadata: JSON.stringify({ subscriberId: user.id, orderId: razorpayOrderId, paymentId: payment.id }),
          },
        });
        await transaction.creatorProfile.update({
          where: { userId: metadata.creatorId },
          data: {
            totalEarnings: { increment: payment.amount },
            availableBalance: { increment: payment.amount },
            monthlyRevenue: { increment: payment.amount },
            ...(!wasActive ? { subscriberCount: { increment: 1 } } : {}),
          },
        });
        const community = await transaction.community.findFirst({ where: { ownerId: metadata.creatorId, deletedAt: null }, select: { id: true } });
        if (community) {
          await transaction.communityMember.upsert({
            where: { communityId_userId: { communityId: community.id, userId: user.id } },
            create: { communityId: community.id, userId: user.id, role: "MEMBER" },
            update: {},
          });
          const memberCount = await transaction.communityMember.count({ where: { communityId: community.id } });
          await transaction.community.update({ where: { id: community.id }, data: { memberCount } });
        }
        await transaction.notification.create({
          data: {
            userId: metadata.creatorId,
            title: "New subscriber",
            message: `${user.name} subscribed to your monthly plan`,
            type: "SYSTEM",
            read: false,
          },
        });
        return { subscription, alreadyVerified: false };
      });

      return NextResponse.json({ success: true, ...result });
    } catch (error) {
      console.error("Razorpay verification failed", { userId: user.id, orderId: razorpayOrderId, message: error?.message });
      return NextResponse.json({ error: "Unable to confirm the Razorpay payment" }, { status: 502 });
    }
  };
}

export const POST = withAuth(createPaymentVerificationHandler());
