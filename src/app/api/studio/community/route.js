import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { withCreatorAuth } from "@/lib/middleware";
import { loadStudioCommunity, mutateStudioCommunity } from "@/lib/studio-community";

const errorResponse = (error) => {
  if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
  if (["Create your community first", "Community post not found"].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 404 });
  if (error.message === "Your creator community already exists") return NextResponse.json({ error: error.message }, { status: 409 });
  console.error("Studio community error", error);
  return NextResponse.json({ error: "Community action failed" }, { status: 500 });
};

export const GET = withCreatorAuth(async (_request, { user }) => {
  try {
    return NextResponse.json(await loadStudioCommunity(db, user));
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = withCreatorAuth(async (request, { user }) => {
  try {
    const body = await request.json();
    return NextResponse.json(await mutateStudioCommunity(db, user, body), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
});
