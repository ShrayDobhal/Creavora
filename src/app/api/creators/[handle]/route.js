import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { getCreatorProfile } from "@/lib/consumer/directory";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createCreatorGet(database = db) {
  return async (_req, { user, params }) => {
    try {
      const { handle } = await params;
      return NextResponse.json(await getCreatorProfile(database, user.id, handle));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load creator");
    }
  };
}

export const GET = withAuth(createCreatorGet());
