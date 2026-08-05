import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/middleware";

export async function GET(req) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const user = auth.user;

    // Get active subscriptions count
    const activeSubsCount = await db.subscription.count({
      where: { userId: user.id, status: "ACTIVE" },
    });

    // Get follower/following counts
    const followersCount = await db.follow.count({
      where: { followingId: user.id },
    });
    const followingCount = await db.follow.count({
      where: { followerId: user.id },
    });

    // Strip sensitive fields
    const { passwordHash, deletedAt, address, ...safeUser } = user;

    return NextResponse.json({
      ...safeUser,
      activeSubsCount,
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error("API Auth Me Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
