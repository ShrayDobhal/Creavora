import { describe, expect, it, vi } from "vitest";
import { loadStudioCommunity, mutateStudioCommunity, parseCommunityAction } from "@/lib/studio-community";

const owner = {
  id: "creator-1",
  name: "Nisha Kapoor",
  handle: "nisha",
  avatar: null,
  roleTitle: "Photographer",
  verified: true,
};

const member = {
  id: "member-1",
  name: "Kabir Rao",
  handle: "kabir",
  avatar: null,
  roleTitle: "Member",
  verified: false,
};

describe("studio community domain", () => {
  it("rejects empty and oversized persisted community actions", () => {
    expect(() => parseCommunityAction({ action: "reply", postId: "post-1", content: "" })).toThrow();
    expect(() => parseCommunityAction({ action: "create-post", kind: "POST", content: "x".repeat(3001) })).toThrow();
  });

  it("builds posts, comments, members, rooms, events and leaderboard from database records", async () => {
    const createdAt = new Date("2026-08-07T08:00:00.000Z");
    const database = {
      community: {
        findFirst: vi.fn().mockResolvedValue({
          id: "community-1",
          name: "Street Frames",
          description: "A photography community",
          avatar: null,
          coverImage: null,
          isPrivate: false,
          createdAt,
          _count: { members: 1, posts: 1, events: 1 },
          members: [{ role: "MEMBER", joinedAt: createdAt, user: member }],
          posts: [{
            id: "post-1",
            authorId: owner.id,
            author: owner,
            content: "How do you frame busy markets?",
            kind: "DISCUSSION",
            mediaUrl: null,
            isPinned: false,
            likesCount: 1,
            repliesCount: 1,
            createdAt,
            likes: [{ userId: owner.id }],
            replies: [{ id: "reply-1", authorId: member.id, author: member, content: "Use leading lines", createdAt }],
          }],
          events: [{ id: "event-1", title: "Photo walk", startAt: createdAt }],
        }),
      },
      liveSession: { findMany: vi.fn().mockResolvedValue([{ id: "room-1", title: "Editing room", scheduledAt: createdAt }]) },
    };

    const result = await loadStudioCommunity(database, owner);

    expect(result.community.counts).toEqual({ members: 2, posts: 1, events: 1, rooms: 1 });
    expect(result.posts[0]).toMatchObject({ kind: "DISCUSSION", viewerLiked: true, repliesCount: 1 });
    expect(result.posts[0].replies[0].author.name).toBe("Kabir Rao");
    expect(result.members.map((entry) => entry.id)).toEqual(expect.arrayContaining([owner.id, member.id]));
    expect(result.rooms).toHaveLength(1);
    expect(result.events).toHaveLength(1);
    expect(result.leaderboard.find((entry) => entry.id === owner.id)).toMatchObject({ posts: 1, likesReceived: 1, points: 12 });
    expect(result.leaderboard.find((entry) => entry.id === member.id)).toMatchObject({ replies: 1, points: 5 });
  });

  it("persists a community like and updates the aggregate count transactionally", async () => {
    const transaction = {
      communityPost: {
        findFirst: vi.fn().mockResolvedValue({ id: "post-1" }),
        update: vi.fn().mockResolvedValue({ likesCount: 4 }),
      },
      communityPostLike: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "like-1" }),
      },
    };
    const database = {
      community: { findFirst: vi.fn().mockResolvedValue({ id: "community-1" }) },
      $transaction: vi.fn((callback) => callback(transaction)),
    };

    const result = await mutateStudioCommunity(database, owner, { action: "toggle-like", postId: "post-1" });

    expect(transaction.communityPostLike.create).toHaveBeenCalledWith({ data: { postId: "post-1", userId: owner.id } });
    expect(transaction.communityPost.update).toHaveBeenCalledWith({ where: { id: "post-1" }, data: { likesCount: { increment: 1 } } });
    expect(result).toEqual({ isLiked: true, likesCount: 4 });
  });
});
