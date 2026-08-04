import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { searchHistorySchema } from "@/lib/consumer/search";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createSearchHistoryGet(database = db) {
  return async (_req, { user }) => {
    try {
      return NextResponse.json(
        await database.searchHistory.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          distinct: ["query"],
        }),
      );
    } catch (error) {
      return consumerErrorResponse(error, "Failed to fetch search history");
    }
  };
}

export function createSearchHistoryPost(database = db) {
  return async (req, { user }) => {
    try {
      const input = searchHistorySchema.parse(await req.json());
      const entry = await database.searchHistory.create({
        data: {
          userId: user.id,
          query: input.query,
          type: input.type ?? null,
        },
      });
      return NextResponse.json(entry, { status: 201 });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to save search history");
    }
  };
}

export const GET = withAuth(createSearchHistoryGet());
export const POST = withAuth(createSearchHistoryPost());
