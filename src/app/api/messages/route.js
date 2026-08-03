import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET messages between Arjun and active contact
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const activeContactName = searchParams.get("active");

    if (!activeContactName) {
      return NextResponse.json({ error: "Active contact name is required" }, { status: 400 });
    }

    // Get Arjun (fan)
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    // Get active contact
    const contact = await db.user.findFirst({
      where: {
        OR: [
          { name: activeContactName },
          { handle: activeContactName.toLowerCase().replace(/[^a-z0-9]/g, "") }
        ]
      }
    });

    if (!user || !contact) {
      return NextResponse.json([]); // Return empty if contact isn't in db yet
    }

    // Fetch messages between user and contact
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: contact.id },
          { senderId: contact.id, receiverId: user.id }
        ]
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Map to frontend expected message object format
    const formattedMessages = messages.map(m => ({
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
}

// POST send new message from Arjun
export async function POST(req) {
  try {
    const { receiverName, content, isAudio, duration } = await req.json();

    // Get Arjun (fan)
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    // Get receiver
    const receiver = await db.user.findFirst({
      where: { name: receiverName },
    });

    if (!user || !receiver) {
      return NextResponse.json({ error: "Sender or Receiver not found" }, { status: 404 });
    }

    // Create the message in database
    const message = await db.message.create({
      data: {
        senderId: user.id,
        receiverId: receiver.id,
        content: content || null,
        isAudio: isAudio || false,
        duration: duration || null,
      }
    });

    const formattedMessage = {
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
}
