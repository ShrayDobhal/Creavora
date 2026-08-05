import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This feature is not available yet" },
    { status: 501 },
  );
}
