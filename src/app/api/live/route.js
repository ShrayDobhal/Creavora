import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { consumerErrorResponse } from "@/lib/consumer/http";
import { getLiveSessions } from "@/lib/consumer/workspace";

export function createLiveGet({ database = db } = {}) {
  return async (_request, { user }) => {
    try {
      return NextResponse.json({
        items: await getLiveSessions(database, user.id),
      });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load live sessions");
    }
  };
}

export const GET = withAuth(createLiveGet());
