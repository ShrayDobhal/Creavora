import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { getDiscovery } from "@/lib/consumer/directory";
import { consumerErrorResponse } from "@/lib/consumer/http";

export function createDiscoveryGet(database = db) {
  return async (_req, { user }) => {
    try {
      return NextResponse.json(await getDiscovery(database, user.id));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load discovery");
    }
  };
}

export const GET = withAuth(createDiscoveryGet());
