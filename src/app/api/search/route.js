import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

// GET unified search results across creators, posts, and communities
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";

    if (!q.trim()) {
      return NextResponse.json({ creators: [], posts: [], communities: [] });
    }

    // Save query to search history
    await db.searchHistory.create({
      data: {
        userId: user.id,
        query: q.trim(),
        type: type !== "all" ? type : null
      }
    });

    let creators = [];
    let posts = [];
    let communities = [];

    // Search Creators
    if (type === "all" || type === "creators") {
      creators = await db.user.findMany({
        where: {
          role: "CREATOR",
          deletedAt: null,
          OR: [
            { name: { contains: q } },
            { handle: { contains: q } },
            { bio: { contains: q } }
          ]
        },
        take: 10,
        select: {
          id: true,
          name: true,
          handle: true,
          avatar: true,
          roleTitle: true,
          verified: true
        }
      });
    }

    // Search Posts
    if (type === "all" || type === "posts") {
      posts = await db.post.findMany({
        where: {
          deletedAt: null,
          content: { contains: q }
        },
        take: 15,
        include: {
          creator: {
            select: {
              name: true,
              handle: true,
              avatar: true,
              verified: true
            }
          }
        }
      });
    }

    // Search Communities
    if (type === "all" || type === "communities") {
      communities = await db.community.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } }
          ]
        },
        take: 10
      });
    }

    return NextResponse.json({
      creators,
      posts,
      communities
    });
  } catch (error) {
    console.error("GET Search Unified Error:", error);
    return NextResponse.json({ error: "Failed to perform unified search query" }, { status: 500 });
  }
});
