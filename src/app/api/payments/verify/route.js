import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { getPaymentProvider } from "@/lib/payments/factory";

// POST verify payment signature callback
export const POST = withAuth(async (req, { user }) => {
  try {
    const { orderId, paymentId, signature, provider = "RAZORPAY" } = await req.json();

    const paymentRecord = await db.payment.findUnique({
      where: { orderId }
    });

    if (!paymentRecord || paymentRecord.userId !== user.id) {
      return NextResponse.json({ error: "Payment record not found or unauthorized" }, { status: 404 });
    }

    const gateway = getPaymentProvider(provider);
    const isValid = await gateway.verifyPayment(paymentId, orderId, signature);

    if (!isValid) {
      await db.payment.update({
        where: { id: paymentRecord.id },
        data: { status: "FAILED" }
      });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Success transaction: Update payment status and increment user wallet balance
    const result = await db.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: "CAPTURED",
          paymentId
        }
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: {
            increment: paymentRecord.amount
          },
          xp: {
            increment: 50 // XP reward for depositing
          }
        }
      });

      // Log wallet transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          amount: paymentRecord.amount,
          type: "DEPOSIT",
          method: provider.toUpperCase(),
          reference: paymentId || orderId,
          status: "COMPLETED"
        }
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Wallet Refill Successful! 💳",
          message: `₹${paymentRecord.amount.toFixed(2)} added to wallet. Received 50 XP!`,
          type: "WALLET",
          read: false
        }
      });

      return { updatedUser, transaction, updatedPayment };
    });

    return NextResponse.json({ success: true, balance: result.updatedUser.walletBalance });
  } catch (error) {
    console.error("POST Verify Payment Error:", error);
    return NextResponse.json({ error: "Failed to verify transaction signature" }, { status: 500 });
  }
});
