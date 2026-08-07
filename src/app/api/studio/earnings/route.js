import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { withCreatorAuth } from "@/lib/middleware";

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date, count) => new Date(date.getFullYear(), date.getMonth() + count, 1);

const sumAmounts = (rows) => rows.reduce((total, row) => total + Number(row.amount || 0), 0);

function monthChange(current, previous) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function transactionLabel(transaction) {
  if (transaction.method) return transaction.method;
  if (transaction.type === "EARNING") return "Creator earning";
  return transaction.type.replaceAll("_", " ").toLowerCase();
}

function daySeries(transactions, now) {
  const days = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    days.push({
      date: day.toISOString(),
      amount: sumAmounts(transactions.filter((item) => item.createdAt >= day && item.createdAt < next)),
    });
  }
  return days;
}

function earningBreakdown(transactions) {
  const totals = new Map();
  for (const transaction of transactions) {
    const label = transactionLabel(transaction);
    totals.set(label, (totals.get(label) || 0) + Number(transaction.amount || 0));
  }
  return [...totals.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((left, right) => right.amount - left.amount);
}

export function createStudioEarningsGet(database = db, clock = () => new Date()) {
  return async (_req, { user: creator }) => {
    try {
      const now = clock();
      const currentMonth = startOfMonth(now);
      const nextMonth = addMonths(currentMonth, 1);
      const previousMonth = addMonths(currentMonth, -1);
      const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

      const [profile, earnings, recentTransactions, payouts, postTotals, activeSubscribers] = await Promise.all([
        database.creatorProfile.findUnique({ where: { userId: creator.id } }),
        database.transaction.findMany({
          where: { userId: creator.id, type: "EARNING", status: "COMPLETED" },
          orderBy: { createdAt: "asc" },
          select: { id: true, amount: true, type: true, method: true, reference: true, status: true, createdAt: true },
        }),
        database.transaction.findMany({
          where: { userId: creator.id },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, amount: true, type: true, method: true, reference: true, status: true, createdAt: true },
        }),
        database.withdrawalRequest.findMany({
          where: { userId: creator.id },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, amount: true, method: true, accountDetails: true, status: true, rejectionReason: true, processedAt: true, createdAt: true },
        }),
        database.post.aggregate({
          where: { creatorId: creator.id, deletedAt: null },
          _count: { _all: true },
          _sum: { viewsCount: true, likesCount: true, commentsCount: true, sharesCount: true },
        }),
        database.subscription.count({ where: { creatorId: creator.id, status: "ACTIVE" } }),
      ]);

      // CreatorProfile is the durable balance aggregate. Keep it as the
      // all-time source of truth for payments captured before ledger entries
      // were introduced, while the ledger powers dated charts and breakdowns.
      const total = Math.max(sumAmounts(earnings), Number(profile?.totalEarnings || 0));
      const thisMonth = sumAmounts(earnings.filter((item) => item.createdAt >= currentMonth && item.createdAt < nextMonth));
      const lastMonth = sumAmounts(earnings.filter((item) => item.createdAt >= previousMonth && item.createdAt < currentMonth));

      return NextResponse.json({
        earnings: {
          total,
          thisMonth,
          lastMonth,
          changePercent: monthChange(thisMonth, lastMonth),
          series: daySeries(earnings.filter((item) => item.createdAt >= thirtyDaysAgo), now),
          breakdown: earningBreakdown(earnings.filter((item) => item.createdAt >= currentMonth && item.createdAt < nextMonth)),
        },
        recentTransactions,
        payouts,
        payoutAccount: {
          method: profile?.payoutMethod || null,
          details: profile?.payoutDetails || null,
          availableBalance: Number(profile?.availableBalance || 0),
        },
        analytics: {
          posts: postTotals._count?._all || 0,
          views: postTotals._sum?.viewsCount || 0,
          likes: postTotals._sum?.likesCount || 0,
          comments: postTotals._sum?.commentsCount || 0,
          shares: postTotals._sum?.sharesCount || 0,
          activeSubscribers,
        },
      });
    } catch (error) {
      console.error("GET Creator Earnings Error:", error);
      return NextResponse.json({ error: "Failed to load studio performance" }, { status: 500 });
    }
  };
}

export function createStudioPayoutPost(database = db) {
  return async (_req, { user: creator }) => {
    try {
      const result = await database.$transaction(async (transaction) => {
        const profile = await transaction.creatorProfile.findUnique({ where: { userId: creator.id } });
        if (!profile?.payoutMethod || !profile?.payoutDetails) return { error: "Add a payout destination in Creator settings first", status: 400 };
        if (profile.availableBalance <= 0) return { error: "No earnings are available for payout", status: 400 };
        const pending = await transaction.withdrawalRequest.findFirst({
          where: { userId: creator.id, status: { in: ["PENDING", "PROCESSING"] } },
          select: { id: true },
        });
        if (pending) return { error: "A payout request is already being processed", status: 409 };

        const amount = profile.availableBalance;
        const withdrawal = await transaction.withdrawalRequest.create({
          data: {
            userId: creator.id,
            amount,
            method: profile.payoutMethod,
            accountDetails: profile.payoutDetails,
          },
        });
        await transaction.creatorProfile.update({
          where: { userId: creator.id },
          data: { availableBalance: { decrement: amount } },
        });
        await transaction.transaction.create({
          data: {
            id: randomUUID(),
            userId: creator.id,
            amount,
            type: "PAYOUT_REQUEST",
            method: profile.payoutMethod,
            reference: withdrawal.id,
            status: "PENDING",
          },
        });
        await transaction.notification.create({
          data: {
            userId: creator.id,
            title: "Payout request submitted",
            message: `Your payout request for ₹${amount.toLocaleString("en-IN")} is under review`,
            type: "WALLET",
            read: false,
            actionUrl: "/studio/payouts",
            metadata: JSON.stringify({ withdrawalId: withdrawal.id }),
          },
        });
        return { withdrawal };
      });

      if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
      return NextResponse.json({ success: true, payout: result.withdrawal }, { status: 201 });
    } catch (error) {
      console.error("POST Payout Request Error:", error);
      return NextResponse.json({ error: "Payout request failed" }, { status: 500 });
    }
  };
}

export const GET = withCreatorAuth(createStudioEarningsGet());
export const POST = withCreatorAuth(createStudioPayoutPost());
