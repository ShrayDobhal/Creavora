import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET creator earnings statistics
export async function GET() {
  try {
    const creator = await db.user.findUnique({
      where: { handle: "ananyasharma" },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Load recent earnings transactions for creator
    const earningsTx = await db.transaction.findMany({
      where: {
        userId: creator.id,
        type: "EARNING"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    });

    // Summing earnings (mocked + direct records to fit display figures)
    // We display standard rounded counts as requested
    const recentPayoutList = earningsTx.map(tx => ({
      title: tx.method || "Subscription Earning",
      who: "From Fan Subscriber",
      when: new Date(tx.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      amount: `₹${tx.amount.toFixed(2)}`
    }));

    return NextResponse.json({
      kpis: [
        { label: "Total Earnings", value: "₹2,48,760.50", delta: "18.6%", up: true, note: "vs last month" },
        { label: "This Month", value: "₹78,540.30", delta: "12.3%", up: true, note: "vs last month" },
        { label: "Last Month", value: "₹70,420.10", delta: "6.1%", up: false, note: "vs previous month" },
        { label: "All Time Earnings", value: "₹5,62,310.80" }
      ],
      recentTransactions: recentPayoutList.length > 0 ? recentPayoutList : [
        { title: "Subscription – VIP", who: "From Rohan Mehta", when: "28 May 2024, 10:30 AM", amount: "₹499.00" },
        { title: "Tip", who: "From Neha Verma", when: "28 May 2024, 09:15 AM", amount: "₹1,000.00" },
        { title: "Paid Message", who: "From Arjun Singh", when: "28 May 2024, 08:45 AM", amount: "₹250.00" }
      ]
    });
  } catch (error) {
    console.error("GET Creator Earnings Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST request payout
export async function POST() {
  try {
    const creator = await db.user.findUnique({
      where: { handle: "ananyasharma" },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Register a payout request transaction
    await db.transaction.create({
      data: {
        userId: creator.id,
        amount: 32840.25, // Mock payout amount
        type: "PAYOUT_REQUEST",
        method: "Bank Transfer",
        reference: `PAYOUT${Math.floor(100000 + Math.random() * 900000)}`,
        status: "PENDING"
      }
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: creator.id,
        title: "Payout Request Submitted",
        message: "Your request for early payout of ₹32,840.25 is under review by finance.",
        type: "SYSTEM",
        read: false
      }
    });

    return NextResponse.json({ success: true, message: "Payout request submitted successfully" });
  } catch (error) {
    console.error("POST Payout Request Error:", error);
    return NextResponse.json({ error: "Payout request failed" }, { status: 500 });
  }
}
