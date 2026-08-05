import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

export const GET = withAuth(async (_req, { user }) => {
  try {
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

export function createWalletDepositPost() {
  return async () =>
    NextResponse.json(
      { error: "This feature is not available yet" },
      { status: 501 },
    );
}

export const POST = withAuth(createWalletDepositPost());
