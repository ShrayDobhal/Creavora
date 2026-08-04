import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { depositSchema, validateBody } from "@/lib/validators";

// GET user transactions list
export const GET = withAuth(async (req, { user }) => {
  try {
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

// POST create deposit
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    
    // Support string amounts from forms
    const validatedBody = {
      ...body,
      amount: typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount
    };

    const { error, data } = validateBody(depositSchema, validatedBody);

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    const depositAmount = data.amount;

    // Perform database transaction to ensure Atomicity
    const result = await db.$transaction(async (tx) => {
      // 1. Update wallet balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: {
            increment: depositAmount,
          },
          xp: {
            increment: 50, // Reward XP for depositing!
          }
        },
      });

      // 2. Register transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          amount: depositAmount,
          type: "DEPOSIT",
          method: data.method,
          reference: data.reference || `REF${Math.floor(100000 + Math.random() * 900000)}`,
          status: "COMPLETED",
        },
      });

      // 3. Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Coins Deposited Successfully",
          message: `₹${depositAmount.toFixed(2)} has been added to your wallet. Received 50 XP!`,
          type: "WALLET",
          read: false,
        },
      });

      return { updatedUser, transaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Wallet Deposit Error:", error);
    return NextResponse.json({ error: "Database error during deposit" }, { status: 500 });
  }
});
