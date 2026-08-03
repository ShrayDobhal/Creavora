import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET user transactions list
export async function GET() {
  try {
    // Get fan user (Arjun)
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST create deposit
export async function POST(req) {
  try {
    const { amount, method, reference } = await req.json();
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    // Get fan user (Arjun)
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
          method: method || "UPI",
          reference: reference || `REF${Math.floor(100000 + Math.random() * 900000)}`,
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
}
