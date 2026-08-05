import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { consumerErrorResponse } from "@/lib/consumer/http";
import { getConsumerHome } from "@/lib/consumer/workspace";

export function createConsumerHomeGet({ database = db } = {}) {
  return async (_request, { user }) => {
    try {
      return NextResponse.json(await getConsumerHome(database, user.id));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load Home");
    }
  };
}

export const GET = withAuth(createConsumerHomeGet());
