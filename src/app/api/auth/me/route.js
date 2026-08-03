import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get active subscriptions count
    const activeSubsCount = await db.subscription.count({
      where: { userId: user.id, status: "ACTIVE" }
    });

    return NextResponse.json({
      ...user,
      activeSubsCount
    });
  } catch (error) {
    console.error("API Auth Me Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
