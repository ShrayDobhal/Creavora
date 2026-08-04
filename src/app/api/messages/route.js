import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { sendMessageSchema, validateBody } from "@/lib/validators";

// GET messages between authenticated user and active contact
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const activeContactName = searchParams.get("active");

    if (!activeContactName) {
      return NextResponse.json({ error: "Active contact name is required" }, { status: 400 });
    }

    // Get active contact
    const contact = await db.user.findFirst({
      where: {
        OR: [
          { name: activeContactName },
          { handle: activeContactName.toLowerCase().replace(/[^a-z0-9]/g, "") }
        ],
        deletedAt: null
      }
    });

    if (!contact) {
      return NextResponse.json([]); // Return empty if contact isn't found
    }

    // Fetch messages between user and contact
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: contact.id },
          { senderId: contact.id, receiverId: user.id }
        ],
        deletedAt: null
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Map to frontend expected message object format
    const formattedMessages = messages.map(m => ({
      id: m.id,
      mine: m.senderId === user.id,
      sender: m.senderId === user.id ? null : contact.name,
      lines: m.content ? [m.content] : [],
      isAudio: m.isAudio,
      duration: m.duration,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("GET Messages Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

// POST send new message from authenticated user
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { error, data } = validateBody(sendMessageSchema, body);

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    let receiverId = data.receiverId;

    // Handle legacy payload where receiverName is sent
    if (!receiverId && body.receiverName) {
      const rec = await db.user.findFirst({
        where: { name: body.receiverName, deletedAt: null }
      });
      if (rec) {
        receiverId = rec.id;
      }
    }

    if (!receiverId) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    // Create the message in database
    const message = await db.message.create({
      data: {
        senderId: user.id,
        receiverId: receiverId,
        content: data.content || null,
        isAudio: data.isAudio || false,
        duration: data.duration || null,
      }
    });

    const senderName = user.name;

    const formattedMessage = {
      id: message.id,
      mine: true,
      sender: null,
      lines: message.content ? [message.content] : [],
      isAudio: message.isAudio,
      duration: message.duration,
      time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error("POST Message Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
});
