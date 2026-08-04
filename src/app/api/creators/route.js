import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

// GET public creator list (optionally filtered by categories)
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q") || "";

    let whereClause = {
      role: "CREATOR",
      deletedAt: null
    };

    if (category && category !== "All") {
      whereClause.creatorProfile = {
        category
      };
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { handle: { contains: query } },
        { bio: { contains: query } }
      ];
    }

    const creators = await db.user.findMany({
      where: whereClause,
      include: {
        creatorProfile: true
      }
    });

    const formattedCreators = creators.map(c => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      avatar: c.avatar,
      coverImage: c.coverImage,
      role: c.roleTitle || c.creatorProfile?.category || "Creator",
      bio: c.bio,
      verified: c.verified,
      price: c.creatorProfile?.monthlyRevenue ? Math.round(c.creatorProfile.monthlyRevenue / 10) : 499, // Fallback placeholder logic
      posts: c.creatorProfile?.subscriberCount ? Math.round(c.creatorProfile.subscriberCount / 20) : 32
    }));

    return NextResponse.json(formattedCreators);
  } catch (error) {
    console.error("GET Creators list error:", error);
    return NextResponse.json({ error: "Failed to load creators list" }, { status: 500 });
  }
});
