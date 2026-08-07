import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleSchema } from "@/lib/validators";

export function createHandleAvailabilityGet(database = db) {
  return async function handleAvailability(request) {
    const raw = new URL(request.url).searchParams.get("handle") || "";
    const parsed = handleSchema.safeParse(raw.replace(/^@+/, ""));
    if (!parsed.success) {
      return NextResponse.json({ available: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const existing = await database.user.findFirst({
      where: { handle: { equals: parsed.data, mode: "insensitive" } },
      select: { id: true },
    });
    return NextResponse.json({ handle: parsed.data, available: !existing }, { headers: { "cache-control": "no-store" } });
  };
}

export const GET = createHandleAvailabilityGet();
