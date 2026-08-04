import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

// GET communities list
export const GET = withAuth(async (req) => {
  try {
    const communities = await db.community.findMany({
      where: { deletedAt: null },
      orderBy: { memberCount: "desc" }
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("GET Communities list error:", error);
    return NextResponse.json({ error: "Failed to load communities" }, { status: 500 });
  }
});
