import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { parseSearchQuery, searchConsumer } from "@/lib/consumer/search";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createSearchGet(database = db) {
  return async (req, { user }) => {
    try {
      const query = parseSearchQuery(new URL(req.url).searchParams);
      return NextResponse.json(await searchConsumer(database, user.id, query));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to search");
    }
  };
}

export const GET = withAuth(createSearchGet());
