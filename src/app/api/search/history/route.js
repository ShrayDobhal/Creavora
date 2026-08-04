import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

// GET recent searches for active user
export const GET = withAuth(async (req, { user }) => {
  try {
    const history = await db.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      distinct: ["query"]
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET Search History Error:", error);
    return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 });
  }
});
