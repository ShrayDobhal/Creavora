import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

// GET notifications for authenticated user
export const GET = withAuth(async (req, { user }) => {
  try {
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

// POST mark all as read
export const POST = withAuth(async (req, { user }) => {
  try {
    await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Notifications Mark Read Error:", error);
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
});

export function createNotificationsDelete(database = db) {
  return async (req, { user }) => {
    try {
      const params = new URL(req.url).searchParams;
      const hasId = params.has("id");
      const id = params.get("id")?.trim();

      if (hasId && !id) {
        return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
      }

      const result = await database.notification.deleteMany({
        where: { ...(id ? { id } : {}), userId: user.id },
      });
      return NextResponse.json({ success: true, deletedCount: result.count });
    } catch (error) {
      console.error("DELETE Notifications Error:", error);
      return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
    }
  };
}

export const DELETE = withAuth(createNotificationsDelete());
