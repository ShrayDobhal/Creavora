import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { databaseIdSchema, sendMessageSchema, validateBody } from "@/lib/validators";
import { consumerErrorResponse } from "@/lib/consumer/http";

const participantSelect = {
  id: true,
  name: true,
  handle: true,
  avatar: true,
  roleTitle: true,
  verified: true,
};

const presentParticipant = (participant) => ({
  id: participant.id,
  name: participant.name,
  handle: participant.handle,
  avatar: participant.avatar ?? null,
  roleTitle: participant.roleTitle ?? null,
  verified: Boolean(participant.verified),
});

const presentMessage = (message, viewerId) => ({
  id: message.id,
  content: message.content,
  mediaUrl: message.mediaUrl ?? null,
  mediaType: message.mediaType ?? null,
  isAudio: Boolean(message.isAudio),
  duration: message.duration ?? null,
  status: message.status,
  createdAt: message.createdAt,
  mine: message.senderId === viewerId,
});

const messageInclude = {
  sender: { select: participantSelect },
  receiver: { select: participantSelect },
};

export function createMessagesGet({ database = db } = {}) {
  return async (req, { user }) => {
    try {
      const participantId = new URL(req.url).searchParams.get("userId");

      if (participantId !== null) {
        const parsedParticipantId = databaseIdSchema.safeParse(participantId);
        if (!parsedParticipantId.success) {
          return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 });
        }
        const participant = await database.user.findFirst({
          where: { id: parsedParticipantId.data, deletedAt: null, banned: false },
          select: participantSelect,
        });
        if (!participant || participant.id === user.id) {
          return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const rows = await database.message.findMany({
          where: {
            OR: [
              { senderId: user.id, receiverId: participant.id },
              { senderId: participant.id, receiverId: user.id },
            ],
            deletedAt: null,
          },
          orderBy: { createdAt: "asc" },
          include: messageInclude,
        });

        return NextResponse.json({
          participant: presentParticipant(participant),
          items: rows.map((message) => presentMessage(message, user.id)),
        });
      }

      const rows = await database.message.findMany({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        include: messageInclude,
      });
      const seen = new Set();
      const items = [];

      for (const message of rows) {
        const participant = message.senderId === user.id ? message.receiver : message.sender;
        if (!participant || seen.has(participant.id)) continue;
        seen.add(participant.id);
        items.push({
          participant: presentParticipant(participant),
          lastMessage: presentMessage(message, user.id),
        });
      }

      const followRows = database.follow?.findMany
        ? await database.follow.findMany({
          where: {
            followerId: user.id,
            ...(seen.size ? { followingId: { notIn: [...seen] } } : {}),
            following: { is: { role: "CREATOR", deletedAt: null, banned: false } },
          },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { following: { select: participantSelect } },
        })
        : [];
      const suggestions = [];

      for (const follow of followRows) {
        const participant = follow.following;
        if (!participant || participant.id === user.id || participant.deletedAt || seen.has(participant.id)) continue;
        seen.add(participant.id);
        suggestions.push(presentParticipant(participant));
      }

      return NextResponse.json({ items, suggestions });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load messages");
    }
  };
}

export function createMessagesPost({ database = db } = {}) {
  return async (req, { user }) => {
    try {
      const body = await req.json();
      const { error, data } = validateBody(sendMessageSchema, body);
      const content = data?.content?.trim();

      if (error || !data?.receiverId || !content) {
        return NextResponse.json(
          { error: "A receiver and message are required", ...(error ? { details: error } : {}) },
          { status: 400 },
        );
      }

      const participant = await database.user.findFirst({
        where: { id: data.receiverId, deletedAt: null, banned: false },
        select: participantSelect,
      });
      if (!participant || participant.id === user.id) {
        return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
      }

      const message = await database.message.create({
        data: {
          senderId: user.id,
          receiverId: participant.id,
          content,
        },
      });

      return NextResponse.json(presentMessage(message, user.id), { status: 201 });
    } catch (error) {
      return consumerErrorResponse(error, "Failed to send message");
    }
  };
}

export const GET = withAuth(createMessagesGet());
export const POST = withAuth(createMessagesPost());
