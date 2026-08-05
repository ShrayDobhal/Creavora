import { describe, expect, it, vi } from "vitest";
import { S3Client } from "@aws-sdk/client-s3";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/middleware", () => ({
  withAuth: (handler) => handler,
  withCreatorAuth: (handler) => handler,
}));

import {
  createProfileGet,
  createProfilePatch,
} from "@/app/api/profile/route";
import { createUploadSignPost } from "@/app/api/uploads/sign/route";
import { createUploadCompletePost } from "@/app/api/uploads/complete/route";
import { createUploadIntent } from "@/lib/storage/r2";
import { createPostPost } from "@/app/api/posts/route";
import {
  createPostDelete,
  createPostPatch,
} from "@/app/api/posts/[id]/route";
import { presentPost } from "@/lib/consumer/presenters";

const jsonRequest = (method, body) =>
  new Request("http://localhost/api/profile", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const profileRow = {
  id: "user-1",
  name: "Neha Rao",
  email: "neha@example.test",
  handle: "neha-runs",
  bio: "Running coach",
  avatar: "https://cdn.example.test/neha.jpg",
  coverImage: "https://cdn.example.test/neha-cover.jpg",
  roleTitle: "Running Coach",
  location: "Bengaluru",
  website: "https://neha.example.test",
  profileVisibility: "PUBLIC",
  deletedAt: null,
  _count: { followers: 12, following: 8, posts: 4 },
};

const imageInput = {
  fileName: "morning-run.webp",
  mimeType: "image/webp",
  bytes: 1024,
  width: 640,
  height: 480,
  kind: "post",
};

const unavailableStorage = {
  getR2Configuration: () => ({ configured: false, reason: "missing_configuration" }),
};

const configuredStorage = {
  getR2Configuration: () => ({ configured: true }),
  buildObjectKey: ({ ownerId, assetId, extension }) => `users/${ownerId}/${assetId}.${extension}`,
  buildPublicUrl: (key) => `https://cdn.example.test/${key}`,
  createUploadIntent: vi.fn(async ({ assetId, ownerId, extension, mimeType }) => {
    const key = `users/${ownerId}/${assetId}.${extension}`;
    return {
      assetId,
      key,
      uploadUrl: "https://uploads.example.test/signed",
      publicUrl: `https://cdn.example.test/${key}`,
      headers: { "content-type": mimeType, "if-none-match": "*" },
    };
  }),
};

describe("Blindly social launch profile API", () => {
  it("returns persisted profile fields and real social counts", async () => {
    const findFirst = vi.fn().mockResolvedValue(profileRow);
    const response = await createProfileGet({ user: { findFirst } })(
      new Request("http://localhost/api/profile"), { user: { id: "user-1" } },
    );
    expect(await response.json()).toMatchObject({
      handle: "neha-runs", location: "Bengaluru", counts: { followers: 12, following: 8, posts: 4 },
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: "user-1", deletedAt: null },
      include: {
        _count: {
          select: {
            followers: { where: { follower: { is: { deletedAt: null } } } },
            following: { where: { following: { is: { deletedAt: null } } } },
            posts: { where: { deletedAt: null } },
          },
        },
      },
    });
  });

  it("rejects a profile update with an invalid website before calling Prisma", async () => {
    const update = vi.fn();
    const response = await createProfilePatch({ user: { update } })(
      jsonRequest("PATCH", { website: "not a url" }), { user: { id: "user-1" } },
    );
    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns a stable not-found response when the profile is soft-deleted", async () => {
    const response = await createProfileGet({
      user: { findFirst: vi.fn().mockResolvedValue(null) },
    })(new Request("http://localhost/api/profile"), { user: { id: "user-1" } });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Profile not found" });
  });

  it("clears an avatar and returns the updated profile payload", async () => {
    const findFirst = vi.fn()
      .mockResolvedValueOnce(profileRow)
      .mockResolvedValueOnce({ ...profileRow, avatar: null });
    const response = await createProfilePatch({
      user: {
        findFirst,
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      mediaAsset: { findFirst: vi.fn() },
    })(jsonRequest("PATCH", { avatar: null }), { user: { id: "user-1" } });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ avatar: null, counts: { posts: 4 } });
  });

  it("rejects an avatar owned by another user", async () => {
    const updateMany = vi.fn();
    const findFirst = vi.fn(({ where }) =>
      Promise.resolve(where.ownerId === "user-1" ? null : { id: "other-avatar" }),
    );
    const response = await createProfilePatch({
      user: { findFirst: vi.fn().mockResolvedValue(profileRow), updateMany },
      mediaAsset: { findFirst },
    })(jsonRequest("PATCH", { avatar: "https://cdn.example.test/other-avatar.jpg" }), {
      user: { id: "user-1" },
    });

    expect(response.status).toBe(400);
    expect(updateMany).not.toHaveBeenCalled();
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        ownerId: "user-1",
        publicUrl: "https://cdn.example.test/other-avatar.jpg",
        deletedAt: null,
        verifiedAt: { not: null },
      },
      select: { id: true },
    });
  });

  it("rejects a cover image owned by another user", async () => {
    const updateMany = vi.fn();
    const response = await createProfilePatch({
      user: { findFirst: vi.fn().mockResolvedValue(profileRow), updateMany },
      mediaAsset: { findFirst: vi.fn().mockResolvedValue(null) },
    })(jsonRequest("PATCH", { coverImage: "https://cdn.example.test/other-cover.jpg" }), {
      user: { id: "user-1" },
    });

    expect(response.status).toBe(400);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("accepts matching owned avatar and cover assets", async () => {
    const findFirst = vi.fn()
      .mockResolvedValueOnce(profileRow)
      .mockResolvedValueOnce({
        ...profileRow,
        avatar: "https://cdn.example.test/owned-avatar.jpg",
        coverImage: "https://cdn.example.test/owned-cover.jpg",
      });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const response = await createProfilePatch({
      user: { findFirst, updateMany },
      mediaAsset: { findFirst: vi.fn().mockResolvedValue({ id: "owned-media" }) },
    })(jsonRequest("PATCH", {
      avatar: "https://cdn.example.test/owned-avatar.jpg",
      coverImage: "https://cdn.example.test/owned-cover.jpg",
    }), { user: { id: "user-1" } });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      avatar: "https://cdn.example.test/owned-avatar.jpg",
      coverImage: "https://cdn.example.test/owned-cover.jpg",
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "user-1", deletedAt: null },
      data: {
        avatar: "https://cdn.example.test/owned-avatar.jpg",
        coverImage: "https://cdn.example.test/owned-cover.jpg",
      },
    });
  });
});

describe("Blindly social launch upload signing API", () => {
  it("fails closed when R2 configuration is absent", async () => {
    const response = await createUploadSignPost({ storage: unavailableStorage })(
      jsonRequest("POST", imageInput), { user: { id: "user-1" } },
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Image uploads are not configured yet" });
  });

  it("creates an owned post-image asset only for a 5 MiB-or-smaller image", async () => {
    const database = { mediaAsset: { create: vi.fn(async ({ data }) => ({ id: data.id, ...data })) } };
    const response = await createUploadSignPost({ storage: configuredStorage, database })(
      jsonRequest("POST", { ...imageInput, bytes: 5242880, mimeType: "image/webp" }),
      { user: { id: "user-1" } },
    );
    expect(response.status).toBe(201);
    expect(database.mediaAsset.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ ownerId: "user-1", kind: "post" }),
    }));
  });

  it("soft-deletes an asset when the signer returns a divergent upload intent", async () => {
    const update = vi.fn();
    const database = {
      mediaAsset: {
        create: vi.fn(async ({ data }) => ({ id: data.id, ...data })),
        update,
      },
    };
    const divergentStorage = {
      ...configuredStorage,
      createUploadIntent: vi.fn(async () => ({
        assetId: "another-asset",
        key: "users/user-1/another-asset.webp",
        uploadUrl: "https://uploads.example.test/signed",
        publicUrl: "https://cdn.example.test/users/user-1/another-asset.webp",
        headers: { "content-type": "image/png" },
      })),
    };

    const response = await createUploadSignPost({ storage: divergentStorage, database })(
      jsonRequest("POST", imageInput), { user: { id: "user-1" } },
    );

    expect(response.status).toBe(500);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ deletedAt: expect.any(Date) }),
    }));
  });

  it("soft-deletes an asset when the signer omits the create-only condition", async () => {
    const update = vi.fn();
    const database = {
      mediaAsset: {
        create: vi.fn(async ({ data }) => ({ id: data.id, ...data })),
        update,
      },
    };
    const missingCreateOnlyStorage = {
      ...configuredStorage,
      createUploadIntent: vi.fn(async ({ assetId, ownerId, extension, mimeType }) => {
        const key = `users/${ownerId}/${assetId}.${extension}`;
        return {
          assetId,
          key,
          uploadUrl: "https://uploads.example.test/signed",
          publicUrl: `https://cdn.example.test/${key}`,
          headers: { "content-type": mimeType },
        };
      }),
    };

    const response = await createUploadSignPost({ storage: missingCreateOnlyStorage, database })(
      jsonRequest("POST", imageInput), { user: { id: "user-1" } },
    );

    expect(response.status).toBe(500);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ deletedAt: expect.any(Date) }),
    }));
  });

  it("binds a storage upload intent to a create-only signed PUT", async () => {
    let command;
    const intent = await createUploadIntent({
      ownerId: "user-1",
      assetId: "asset-1",
      extension: "webp",
      mimeType: "image/webp",
      env: {
        R2_ACCOUNT_ID: "account",
        R2_ACCESS_KEY_ID: "access",
        R2_SECRET_ACCESS_KEY: "secret",
        R2_BUCKET: "uploads",
        R2_PUBLIC_BASE_URL: "https://cdn.example.test/",
      },
      client: {},
      presign: vi.fn(async (_client, receivedCommand) => {
        command = receivedCommand;
        return "https://uploads.example.test/signed";
      }),
    });

    expect(command.input).toMatchObject({
      Bucket: "uploads",
      Key: "users/user-1/asset-1.webp",
      ContentType: "image/webp",
      IfNoneMatch: "*",
    });
    expect(intent.headers).toEqual({
      "content-type": "image/webp",
      "if-none-match": "*",
    });
  });

  it("includes content-type and create-only headers in the real AWS signed-header list", async () => {
    const intent = await createUploadIntent({
      ownerId: "user-1",
      assetId: "asset-1",
      extension: "webp",
      mimeType: "image/webp",
      env: {
        R2_ACCOUNT_ID: "account",
        R2_ACCESS_KEY_ID: "access",
        R2_SECRET_ACCESS_KEY: "secret",
        R2_BUCKET: "uploads",
        R2_PUBLIC_BASE_URL: "https://cdn.example.test",
      },
      client: new S3Client({
        endpoint: "https://account.r2.cloudflarestorage.com",
        region: "auto",
        credentials: { accessKeyId: "access", secretAccessKey: "secret" },
      }),
    });

    const signedHeaders = new URL(intent.uploadUrl)
      .searchParams
      .get("X-Amz-SignedHeaders")
      .split(";");
    expect(signedHeaders).toEqual(expect.arrayContaining(["content-type", "if-none-match"]));
  });

  it("rejects an image larger than 5 MiB before persisting an asset", async () => {
    const database = { mediaAsset: { create: vi.fn() } };
    const response = await createUploadSignPost({ storage: configuredStorage, database })(
      jsonRequest("POST", { ...imageInput, bytes: 5242881 }),
      { user: { id: "user-1" } },
    );
    expect(response.status).toBe(413);
    expect(database.mediaAsset.create).not.toHaveBeenCalled();
  });

  it("rejects a non-image MIME type before persisting an asset", async () => {
    const database = { mediaAsset: { create: vi.fn() } };
    const response = await createUploadSignPost({ storage: configuredStorage, database })(
      jsonRequest("POST", { ...imageInput, mimeType: "application/pdf" }),
      { user: { id: "user-1" } },
    );
    expect(response.status).toBe(400);
    expect(database.mediaAsset.create).not.toHaveBeenCalled();
  });
});

describe("Blindly social launch upload completion API", () => {
  const pendingAsset = {
    id: "9cd87ddd-5890-467d-8feb-17c83f432111",
    ownerId: "user-1",
    key: "users/user-1/9cd87ddd-5890-467d-8feb-17c83f432111.webp",
    publicUrl: "https://cdn.example.test/users/user-1/9cd87ddd-5890-467d-8feb-17c83f432111.webp",
    mimeType: "image/webp",
    bytes: 1024,
    verifiedAt: null,
  };

  it("activates an asset only after R2 confirms its signed image metadata", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = {
      mediaAsset: {
        findFirst: vi.fn().mockResolvedValue(pendingAsset),
        updateMany,
      },
    };
    const storage = {
      getR2Configuration: () => ({ configured: true }),
      getObjectMetadata: vi.fn().mockResolvedValue({ ContentLength: 1024, ContentType: "image/webp" }),
    };

    const response = await createUploadCompletePost({ storage, database })(
      jsonRequest("POST", { assetId: pendingAsset.id }), { user: { id: "user-1" } },
    );

    expect(response.status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: pendingAsset.id, ownerId: "user-1", deletedAt: null, verifiedAt: null }),
      data: expect.objectContaining({ verifiedAt: expect.any(Date) }),
    }));
  });

  it("soft-deletes an uploaded object whose actual length differs from its signed metadata", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = {
      mediaAsset: {
        findFirst: vi.fn().mockResolvedValue(pendingAsset),
        updateMany,
      },
    };
    const storage = {
      getR2Configuration: () => ({ configured: true }),
      getObjectMetadata: vi.fn().mockResolvedValue({ ContentLength: 5242881, ContentType: "image/webp" }),
    };

    const response = await createUploadCompletePost({ storage, database })(
      jsonRequest("POST", { assetId: pendingAsset.id }), { user: { id: "user-1" } },
    );

    expect(response.status).toBe(400);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ deletedAt: expect.any(Date) }),
    }));
  });
});

describe("Blindly social launch post API", () => {
  const owner = { id: "user-1", name: "Neha Rao", role: "USER" };
  const assetId = "9cd87ddd-5890-467d-8feb-17c83f432111";

  it("lets a USER publish an owned signed image post", async () => {
    const queryRaw = vi.fn().mockResolvedValue([{
      id: "post-1",
      creatorId: owner.id,
      content: "A morning update",
      mediaUrl: "https://cdn.example.test/users/user-1/post.webp",
      mediaType: "image/webp",
      isPremium: false,
      price: 0,
    }]);
    const response = await createPostPost({
      database: {
        $queryRaw: queryRaw,
        follow: { findMany: vi.fn().mockResolvedValue([]) },
      },
    })(jsonRequest("POST", { content: "A morning update", mediaAssetId: assetId }), { user: owner });

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      content: "A morning update",
      mediaUrl: "https://cdn.example.test/users/user-1/post.webp",
      mediaType: "image/webp",
      isPremium: false,
      price: 0,
    });
    expect(queryRaw).toHaveBeenCalledOnce();
  });

  it("rejects a foreign, unverified, or wrong-kind media asset", async () => {
    const queryRaw = vi.fn().mockResolvedValue([]);
    const response = await createPostPost({
      database: {
        $queryRaw: queryRaw,
      },
    })(jsonRequest("POST", { content: "A morning update", mediaAssetId: assetId }), { user: owner });

    expect(response.status).toBe(400);
    expect(queryRaw).toHaveBeenCalledOnce();
  });

  it("rejects a post when its authorized media is invalidated before conditional persistence", async () => {
    const create = vi.fn().mockResolvedValue({ id: "post-1" });
    const asset = { deletedAt: null };
    const invalidateAsset = vi.fn(() => {
      asset.deletedAt = new Date();
    });
    const queryRaw = vi.fn(async () => {
      // A concurrent soft-delete wins after a stale authorization read.
      invalidateAsset();
      return asset.deletedAt ? [] : [{ id: "post-1" }];
    });
    const response = await createPostPost({
      database: {
        $queryRaw: queryRaw,
        mediaAsset: {
          // This stale authorization result models the pre-fix read/create race.
          findFirst: vi.fn().mockResolvedValue({
            publicUrl: "https://cdn.example.test/users/user-1/post.webp",
            mimeType: "image/webp",
          }),
        },
        post: { create },
      },
    })(jsonRequest("POST", { content: "A morning update", mediaAssetId: assetId }), { user: owner });

    expect(response.status).toBe(400);
    expect(invalidateAsset).toHaveBeenCalledOnce();
    expect(queryRaw).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 403 when another account attempts to edit a post", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const response = await createPostPatch({ post: {
      updateMany,
      findFirst: vi.fn().mockResolvedValue({ id: "post-foreign" }),
    } })(
      jsonRequest("PATCH", { content: "Edited copy" }),
      { user: owner, params: Promise.resolve({ id: "post-foreign" }) },
    );

    expect(response.status).toBe(403);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "post-foreign", creatorId: owner.id, deletedAt: null },
      data: { content: "Edited copy" },
    });
  });

  it("soft-deletes an owned post and returns 204", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const response = await createPostDelete({ post: { updateMany } })(
      new Request("http://localhost/api/posts/post-1", { method: "DELETE" }),
      { user: owner, params: Promise.resolve({ id: "post-1" }) },
    );

    expect(response.status).toBe(204);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "post-1", creatorId: owner.id, deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("surfaces viewer management from actual post ownership", () => {
    const post = presentPost({
      id: "post-1",
      creatorId: owner.id,
      content: "A morning update",
      mediaUrl: null,
      mediaType: null,
      isPremium: false,
      publishedAt: new Date("2026-08-05T00:00:00.000Z"),
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      sharesCount: 0,
      creator: { ...owner, handle: "someone-else" },
      likes: [],
      bookmarks: [],
      creatorFollowers: [],
    }, owner.id);

    expect(post.viewer.canManage).toBe(true);
  });
});
