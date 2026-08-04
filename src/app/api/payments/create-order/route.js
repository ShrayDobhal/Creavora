import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { getPaymentProvider } from "@/lib/payments/factory";

// POST create payment order
export const POST = withAuth(async (req, { user }) => {
  try {
    const { amount, provider = "RAZORPAY", metadata = {} } = await req.json();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    const gateway = getPaymentProvider(provider);
    const order = await gateway.createOrder(parsedAmount, "INR", {
      ...metadata,
      userId: user.id
    });

    // Save payment record in DB
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        orderId: order.orderId,
        amount: parsedAmount,
        provider: provider.toUpperCase(),
        status: "CREATED",
        metadata: JSON.stringify(metadata)
      }
    });

    return NextResponse.json({
      orderId: order.orderId,
      paymentId: payment.id,
      amount: parsedAmount,
      keyId: provider.toUpperCase() === "RAZORPAY" ? gateway.keyId : null
    });
  } catch (error) {
    console.error("POST Create Payment Order Error:", error);
    return NextResponse.json({ error: "Failed to initialize payment gateway order" }, { status: 500 });
  }
});
