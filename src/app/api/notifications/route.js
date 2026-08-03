import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET notifications for Arjun
export async function GET() {
  try {
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST mark all as read
export async function POST() {
  try {
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Notifications Mark Read Error:", error);
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}
