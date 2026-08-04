import { createCommentSchema } from "../validators";

const findPost = (tx, postId) =>
  tx.post.findFirst({ where: { id: postId, deletedAt: null } });

const postMissing = () => {
  throw new Error("Post not found");
};

export async function toggleLike(db, user, postId) {
  return db.$transaction(async (tx) => {
    const post = await findPost(tx, postId);
    if (!post) postMissing();

    const existing = await tx.like.findUnique({
      where: { userId_postId: { userId: user.id, postId: post.id } },
    });

    if (existing) {
      await tx.like.delete({ where: { id: existing.id } });
      const updated = await tx.post.update({
        where: { id: post.id },
        data: { likesCount: { decrement: 1 } },
      });
      return { isLiked: false, likesCount: updated.likesCount };
    }

    await tx.like.create({ data: { userId: user.id, postId: post.id } });
    const updated = await tx.post.update({
      where: { id: post.id },
      data: { likesCount: { increment: 1 } },
    });

    if (post.creatorId !== user.id) {
      await tx.notification.create({
        data: {
          userId: post.creatorId,
          title: "New Like",
          message: `${user.name} liked your post.`,
          type: "LIKE",
          read: false,
        },
      });
    }

    return { isLiked: true, likesCount: updated.likesCount };
  });
}

export async function toggleBookmark(db, userId, postId) {
  return db.$transaction(async (tx) => {
    const post = await findPost(tx, postId);
    if (!post) postMissing();

    const existing = await tx.bookmark.findUnique({
      where: { userId_postId: { userId, postId: post.id } },
    });

    if (existing) {
      await tx.bookmark.delete({ where: { id: existing.id } });
      return { isBookmarked: false };
    }

    await tx.bookmark.create({ data: { userId, postId: post.id } });
    return { isBookmarked: true };
  });
}

export async function toggleFollow(db, user, handle) {
  return db.$transaction(async (tx) => {
    const creator = await tx.user.findFirst({
      where: { handle, role: "CREATOR", deletedAt: null },
    });
    if (!creator) throw new Error("Creator not found");

    const existing = await tx.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: creator.id,
        },
      },
    });

    if (existing) {
      await tx.follow.delete({ where: { id: existing.id } });
      return { isFollowing: false };
    }

    await tx.follow.create({
      data: { followerId: user.id, followingId: creator.id },
    });

    if (creator.id !== user.id) {
      await tx.notification.create({
        data: {
          userId: creator.id,
          title: "New Follower",
          message: `${user.name} started following you.`,
          type: "FOLLOW",
          read: false,
        },
      });
    }

    return { isFollowing: true };
  });
}

export async function createComment(db, user, postId, input) {
  const data = createCommentSchema.parse(input);

  return db.$transaction(async (tx) => {
    const post = await findPost(tx, postId);
    if (!post) postMissing();

    const comment = await tx.comment.create({
      data: {
        userId: user.id,
        postId: post.id,
        content: data.content,
        parentId: data.parentId ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            verified: true,
          },
        },
      },
    });
    const updated = await tx.post.update({
      where: { id: post.id },
      data: { commentsCount: { increment: 1 } },
    });

    if (post.creatorId !== user.id) {
      await tx.notification.create({
        data: {
          userId: post.creatorId,
          title: "New Comment",
          message: `${user.name} commented: "${data.content.slice(0, 30)}..."`,
          type: "COMMENT",
          read: false,
        },
      });
    }

    return { comment, commentsCount: updated.commentsCount };
  });
}
