import { createCommentSchema } from "../validators";
import { getPublicHandleCandidates } from "./public-copy";

const ERRORS = Object.freeze({
  invalidUser: "Invalid user",
  invalidUserId: "Invalid user ID",
  invalidPostId: "Invalid post ID",
  invalidHandle: "Invalid creator handle",
  postNotFound: "Post not found",
  creatorNotFound: "Creator not found",
  parentNotFound: "Parent comment not found",
});

const requireNonEmptyString = (value, error) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(error);
  return value;
};

const validateUser = (user) => {
  if (!user || typeof user !== "object") throw new Error(ERRORS.invalidUser);
  requireNonEmptyString(user.id, ERRORS.invalidUser);
  requireNonEmptyString(user.name, ERRORS.invalidUser);
};

const findPost = (database, postId) =>
  database.post.findFirst({
    where: { id: postId, deletedAt: null, creator: { is: { deletedAt: null } } },
  });

const postMissing = () => {
  throw new Error(ERRORS.postNotFound);
};

const isUniqueConflict = (error) => error?.code === "P2002";

async function findCreatorByPublicHandle(database, handle) {
  for (const candidate of getPublicHandleCandidates(handle)) {
    const creator = await database.user.findFirst({
      where: { handle: candidate, role: "CREATOR", deletedAt: null },
    });
    if (creator) return creator;
  }
  return null;
}

async function notifySafely(database, data) {
  if (!data) return;
  try {
    await database.notification.create({ data });
  } catch (error) {
    console.error("Consumer notification delivery failed", {
      type: data.type,
      userId: data.userId,
      message: error?.message || "Unknown notification error",
    });
  }
}

export async function toggleLike(db, user, postId) {
  validateUser(user);
  requireNonEmptyString(postId, ERRORS.invalidPostId);

  try {
    const outcome = await db.$transaction(async (tx) => {
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
        return { result: { isLiked: false, likesCount: updated.likesCount } };
      }

      await tx.like.create({ data: { userId: user.id, postId: post.id } });
      const updated = await tx.post.update({
        where: { id: post.id },
        data: { likesCount: { increment: 1 } },
      });
      return {
        result: { isLiked: true, likesCount: updated.likesCount },
        notification:
          post.creatorId === user.id
            ? null
            : {
                userId: post.creatorId,
                title: "New Like",
                message: `${user.name} liked your post.`,
                type: "LIKE",
                read: false,
              },
      };
    });

    await notifySafely(db, outcome.notification);
    return outcome.result;
  } catch (error) {
    if (!isUniqueConflict(error)) throw error;
    const [existing, post] = await Promise.all([
      db.like.findUnique({
        where: { userId_postId: { userId: user.id, postId } },
      }),
      findPost(db, postId),
    ]);
    if (!post) postMissing();
    if (existing) return { isLiked: true, likesCount: post.likesCount };
    throw error;
  }
}

export async function toggleBookmark(db, userId, postId) {
  requireNonEmptyString(userId, ERRORS.invalidUserId);
  requireNonEmptyString(postId, ERRORS.invalidPostId);

  try {
    return await db.$transaction(async (tx) => {
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
  } catch (error) {
    if (!isUniqueConflict(error)) throw error;
    const existing = await db.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) return { isBookmarked: true };
    throw error;
  }
}

export async function toggleFollow(db, user, handle) {
  validateUser(user);
  requireNonEmptyString(handle, ERRORS.invalidHandle);

  try {
    const outcome = await db.$transaction(async (tx) => {
      const creator = await findCreatorByPublicHandle(tx, handle);
      if (!creator) throw new Error(ERRORS.creatorNotFound);

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
        return { result: { isFollowing: false } };
      }

      await tx.follow.create({
        data: { followerId: user.id, followingId: creator.id },
      });
      return {
        result: { isFollowing: true },
        notification:
          creator.id === user.id
            ? null
            : {
                userId: creator.id,
                title: "New Follower",
                message: `${user.name} started following you.`,
                type: "FOLLOW",
                read: false,
              },
      };
    });

    await notifySafely(db, outcome.notification);
    return outcome.result;
  } catch (error) {
    if (!isUniqueConflict(error)) throw error;
    const creator = await findCreatorByPublicHandle(db, handle);
    if (!creator) throw new Error(ERRORS.creatorNotFound);
    const existing = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: creator.id,
        },
      },
    });
    if (existing) return { isFollowing: true };
    throw error;
  }
}

export async function createComment(db, user, postId, input) {
  validateUser(user);
  requireNonEmptyString(postId, ERRORS.invalidPostId);
  const data = createCommentSchema.parse(input);

  const outcome = await db.$transaction(async (tx) => {
    const post = await findPost(tx, postId);
    if (!post) postMissing();

    if (data.parentId) {
      const parent = await tx.comment.findFirst({
        where: { id: data.parentId, postId: post.id, deletedAt: null },
      });
      if (!parent) throw new Error(ERRORS.parentNotFound);
    }

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
    return {
      result: { comment, commentsCount: updated.commentsCount },
      notification:
        post.creatorId === user.id
          ? null
          : {
              userId: post.creatorId,
              title: "New Comment",
              message: `${user.name} commented: "${data.content.slice(0, 30)}..."`,
              type: "COMMENT",
              read: false,
            },
    };
  });

  await notifySafely(db, outcome.notification);
  return outcome.result;
}
