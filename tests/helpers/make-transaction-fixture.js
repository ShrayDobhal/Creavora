const matchesCompositeKey = (where, fields) =>
  Object.entries(fields).every(([field, value]) => where?.[field] === value);

const applyNumberUpdate = (record, data) => {
  for (const [field, operation] of Object.entries(data)) {
    if (operation?.increment) record[field] += operation.increment;
    if (operation?.decrement) record[field] -= operation.decrement;
  }
  return record;
};

export function makeTransactionFixture({
  posts = [
    {
      id: "post-1",
      creatorId: "creator-1",
      content: "A public post",
      mediaUrl: null,
      mediaType: null,
      isPremium: false,
      price: 0,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      sharesCount: 0,
      publishedAt: new Date("2026-08-01T10:00:00.000Z"),
      deletedAt: null,
      creator: {
        id: "creator-1",
        name: "Asha",
        handle: "asha",
        avatar: null,
        roleTitle: "Artist",
        verified: false,
        deletedAt: null,
        creatorProfile: { subscriberCount: 0 },
        followers: [],
      },
      likes: [],
      bookmarks: [],
    },
  ],
  users = [
    { id: "creator-1", handle: "asha", role: "CREATOR", deletedAt: null },
  ],
  follows = [],
  likes = [],
  bookmarks = [],
  subscriptions = [],
  comments: initialComments = [],
  likeCreateConflict = false,
  bookmarkCreateConflict = false,
  followCreateConflict = false,
  notificationCreateError = null,
} = {}) {
  const notifications = [];
  const comments = [...initialComments];
  const calls = {
    transactions: 0,
    postFindMany: [],
    postFindFirst: [],
    commentFindFirst: [],
  };

  const db = {
    $transaction: async (callback) => {
      calls.transactions += 1;
      return callback(db);
    },
    post: {
      findFirst: async ({ where }) => {
        calls.postFindFirst.push(where);
        return posts.find(
          (post) =>
            post.id === where.id &&
            post.deletedAt === null &&
            (!where.creator || post.creator?.deletedAt === where.creator.is?.deletedAt),
        ) ?? null;
      },
      findMany: async (args) => {
        calls.postFindMany.push(args);
        return posts;
      },
      update: async ({ where, data }) => {
        const post = posts.find((item) => item.id === where.id);
        return applyNumberUpdate(post, data);
      },
    },
    like: {
      findUnique: async ({ where }) =>
        likes.find((like) =>
          matchesCompositeKey(where.userId_postId, {
            userId: like.userId,
            postId: like.postId,
          }),
        ) ?? null,
      create: async ({ data }) => {
        if (likeCreateConflict) {
          likes.push({ id: `like-${likes.length + 1}`, ...data });
          posts.find((post) => post.id === data.postId).likesCount += 1;
          throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
        }
        const like = { id: `like-${likes.length + 1}`, ...data };
        likes.push(like);
        return like;
      },
      delete: async ({ where }) => {
        const index = likes.findIndex((like) => like.id === where.id);
        return likes.splice(index, 1)[0];
      },
    },
    bookmark: {
      findUnique: async ({ where }) =>
        bookmarks.find((bookmark) =>
          matchesCompositeKey(where.userId_postId, {
            userId: bookmark.userId,
            postId: bookmark.postId,
          }),
        ) ?? null,
      create: async ({ data }) => {
        if (bookmarkCreateConflict) {
          bookmarks.push({ id: `bookmark-${bookmarks.length + 1}`, ...data });
          throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
        }
        const bookmark = { id: `bookmark-${bookmarks.length + 1}`, ...data };
        bookmarks.push(bookmark);
        return bookmark;
      },
      delete: async ({ where }) => {
        const index = bookmarks.findIndex((bookmark) => bookmark.id === where.id);
        return bookmarks.splice(index, 1)[0];
      },
    },
    follow: {
      findMany: async ({ where }) =>
        follows.filter((follow) => follow.followerId === where.followerId),
      findUnique: async ({ where }) =>
        follows.find((follow) =>
          matchesCompositeKey(where.followerId_followingId, {
            followerId: follow.followerId,
            followingId: follow.followingId,
          }),
        ) ?? null,
      create: async ({ data }) => {
        if (followCreateConflict) {
          follows.push({ id: `follow-${follows.length + 1}`, ...data });
          throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
        }
        const follow = { id: `follow-${follows.length + 1}`, ...data };
        follows.push(follow);
        return follow;
      },
      delete: async ({ where }) => {
        const index = follows.findIndex((follow) => follow.id === where.id);
        return follows.splice(index, 1)[0];
      },
    },
    subscription: {
      findMany: async ({ where }) =>
        subscriptions.filter(
          (subscription) =>
            subscription.userId === where.userId && subscription.status === where.status,
        ),
    },
    user: {
      findFirst: async ({ where }) =>
        users.find(
          (user) =>
            user.handle === where.handle &&
            user.role === where.role &&
            user.deletedAt === null,
        ) ?? null,
    },
    notification: {
      create: async ({ data }) => {
        if (notificationCreateError) throw notificationCreateError;
        notifications.push(data);
        return data;
      },
    },
    comment: {
      findFirst: async ({ where }) => {
        calls.commentFindFirst.push(where);
        return comments.find(
          (comment) =>
            comment.id === where.id &&
            comment.postId === where.postId &&
            comment.deletedAt === null,
        ) ?? null;
      },
      create: async ({ data, include }) => {
        const comment = {
          id: `comment-${comments.length + 1}`,
          ...data,
          user: include ? { id: data.userId, name: "Viewer", handle: "viewer" } : undefined,
        };
        comments.push(comment);
        return comment;
      },
    },
  };

  return {
    db,
    posts,
    users,
    follows,
    likes,
    bookmarks,
    subscriptions,
    notifications,
    comments,
    calls,
  };
}
