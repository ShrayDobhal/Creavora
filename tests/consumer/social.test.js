import { describe, expect, it } from "vitest";
import {
  createComment,
  toggleBookmark,
  toggleFollow,
  toggleLike,
} from "@/lib/consumer/social";
import { makeTransactionFixture } from "../helpers/make-transaction-fixture";

describe("social services", () => {
  it("does not create a self-like notification", async () => {
    const tx = makeTransactionFixture();

    const result = await toggleLike(
      tx.db,
      { id: "creator-1", name: "Asha" },
      "post-1",
    );

    expect(result).toEqual({ isLiked: true, likesCount: 1 });
    expect(tx.notifications).toHaveLength(0);
    expect(tx.calls.transactions).toBe(1);
  });

  it("removes an existing like and decrements its aggregate count in the transaction", async () => {
    const tx = makeTransactionFixture({
      posts: [{ ...makeTransactionFixture().posts[0], likesCount: 2 }],
      likes: [{ id: "like-1", userId: "viewer-1", postId: "post-1" }],
    });

    await expect(
      toggleLike(tx.db, { id: "viewer-1", name: "Viewer" }, "post-1"),
    ).resolves.toEqual({ isLiked: false, likesCount: 1 });
    expect(tx.likes).toHaveLength(0);
    expect(tx.calls.transactions).toBe(1);
  });

  it("toggles bookmarks within the transaction after loading a non-deleted post", async () => {
    const tx = makeTransactionFixture();

    await expect(toggleBookmark(tx.db, "viewer-1", "post-1")).resolves.toEqual({
      isBookmarked: true,
    });
    expect(tx.bookmarks).toMatchObject([{ userId: "viewer-1", postId: "post-1" }]);
    expect(tx.calls.transactions).toBe(1);
  });

  it("notifies a different creator when following them", async () => {
    const tx = makeTransactionFixture();

    await expect(
      toggleFollow(tx.db, { id: "viewer-1", name: "Viewer" }, "asha"),
    ).resolves.toEqual({ isFollowing: true });
    expect(tx.notifications).toMatchObject([
      { userId: "creator-1", type: "FOLLOW", read: false },
    ]);
    expect(tx.calls.transactions).toBe(1);
  });

  it("creates a validated comment, increments the post count, and notifies the owner", async () => {
    const tx = makeTransactionFixture();

    const result = await createComment(
      tx.db,
      { id: "viewer-1", name: "Viewer" },
      "post-1",
      { content: "Great work" },
    );

    expect(result).toMatchObject({
      comment: { postId: "post-1", userId: "viewer-1", content: "Great work" },
      commentsCount: 1,
    });
    expect(tx.notifications).toMatchObject([
      { userId: "creator-1", type: "COMMENT", read: false },
    ]);
    expect(tx.calls.transactions).toBe(1);
  });

  it("rejects invalid comment content before changing the post", async () => {
    const tx = makeTransactionFixture();

    await expect(
      createComment(tx.db, { id: "viewer-1", name: "Viewer" }, "post-1", { content: "" }),
    ).rejects.toThrow("Comment cannot be empty");
    expect(tx.comments).toHaveLength(0);
    expect(tx.posts[0].commentsCount).toBe(0);
  });

  it("does not mutate a post whose creator was soft-deleted", async () => {
    const tx = makeTransactionFixture({
      posts: [
        {
          ...makeTransactionFixture().posts[0],
          creator: { ...makeTransactionFixture().posts[0].creator, deletedAt: new Date() },
        },
      ],
    });

    await expect(
      toggleLike(tx.db, { id: "viewer-1", name: "Viewer" }, "post-1"),
    ).rejects.toThrow("Post not found");
    expect(tx.likes).toHaveLength(0);
    expect(tx.calls.postFindFirst[0]).toMatchObject({
      creator: { is: { deletedAt: null } },
    });
  });

  it("rejects malformed actor and target identifiers before opening a transaction", async () => {
    const tx = makeTransactionFixture();

    await expect(toggleLike(tx.db, { id: "", name: "Viewer" }, "post-1")).rejects.toThrow(
      "Invalid user",
    );
    await expect(toggleBookmark(tx.db, "viewer-1", " ")).rejects.toThrow("Invalid post ID");
    await expect(
      toggleFollow(tx.db, { id: "viewer-1", name: "Viewer" }, " "),
    ).rejects.toThrow("Invalid creator handle");
    expect(tx.calls.transactions).toBe(0);
  });

  it.each([
    ["missing", "f47ac10b-58cc-4372-a567-0e02b2c3d479", []],
    [
      "from another post",
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      [
        {
          id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
          postId: "post-2",
          deletedAt: null,
        },
      ],
    ],
    [
      "soft-deleted",
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      [
        {
          id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
          postId: "post-1",
          deletedAt: new Date(),
        },
      ],
    ],
  ])("rejects a %s comment parent", async (_description, parentId, comments) => {
    const tx = makeTransactionFixture({ comments });

    await expect(
      createComment(
        tx.db,
        { id: "viewer-1", name: "Viewer" },
        "post-1",
        { content: "Reply", parentId },
      ),
    ).rejects.toThrow("Parent comment not found");
    expect(tx.comments).toHaveLength(comments.length);
    expect(tx.posts[0].commentsCount).toBe(0);
  });
});
