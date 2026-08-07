import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";

function metadataActionUrl(notification) {
  try {
    const metadata = JSON.parse(notification.metadata || "{}");
    if (typeof metadata.postId === "string") return `/post/${encodeURIComponent(metadata.postId)}`;
    if (metadata.eventId || metadata.sessionId) return "/live";
    if (metadata.conversationId) return "/messages";
  } catch {
    // Older notifications may not contain JSON metadata.
  }
  if (notification.type === "LIVE" || /\b(event|session|interaction|hangout)\b/i.test(`${notification.title} ${notification.message}`)) return "/live";
  if (notification.type === "MESSAGE") return "/messages";
  if (notification.type === "WALLET") return "/wallet";
  return null;
}

async function legacyPostActionUrl(database, notification) {
  const match = notification.title?.match(/^new post by\s+(.+?)(?:!)?$/i);
  if (!match) return null;
  const post = await database.post.findFirst({
    where: {
      creator: { name: { equals: match[1].trim(), mode: "insensitive" } },
      createdAt: { lte: notification.createdAt },
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  return post ? `/post/${post.id}` : null;
}

export function createNotificationsGet(database = db) {
  return async (req, { user }) => {
  try {
    const notifications = await database.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    const presented = await Promise.all(notifications.map(async (notification) => ({
      ...notification,
      actionUrl: notification.actionUrl
        || metadataActionUrl(notification)
        || await legacyPostActionUrl(database, notification),
    })));
    return NextResponse.json(presented);
  } catch (error) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  };
}

// GET notifications for authenticated user
export const GET = withAuth(createNotificationsGet());

// POST marks one notification read when an id is supplied, otherwise all.
export const POST = withAuth(async (req, { user }) => {
  try {
    let id = null;
    try {
      const body = await req.json();
      id = typeof body?.id === "string" ? body.id.trim() : null;
    } catch {
      // An empty request body keeps the existing mark-all behavior.
    }
    await db.notification.updateMany({
      where: { ...(id ? { id } : {}), userId: user.id, read: false },
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
