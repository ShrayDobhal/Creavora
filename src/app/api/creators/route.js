import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { getCreatorPage, parseCreatorQuery } from "@/lib/consumer/directory";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createCreatorsGet(database = db) {
  return async (req, { user }) => {
    try {
      const query = parseCreatorQuery(new URL(req.url).searchParams);
      return NextResponse.json(await getCreatorPage(database, user.id, query));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load creators");
    }
  };
}

export const GET = withAuth(createCreatorsGet());
