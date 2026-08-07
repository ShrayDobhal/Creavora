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
import { createDatabaseUploadPut, createUploadDataPut } from "@/app/api/uploads/[id]/data/route";
import { createMediaGet } from "@/app/api/media/[id]/route";
import { createUploadIntent } from "@/lib/storage/r2";
import { uploadObject as uploadBunnyObject } from "@/lib/storage/bunny";
import { createVideoUploadIntent } from "@/lib/storage/bunny-stream";
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
  address: "Bandra West, Mumbai 400050",
  phone: "+91 98765 43210",
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
      handle: "neha-runs", location: "Bengaluru", address: "Bandra West, Mumbai 400050", phone: "+91 98765 43210", counts: { followers: 12, following: 8, posts: 4 },
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

  it("stores a whitespace-only address as null after request validation", async () => {
    const findFirst = vi.fn()
      .mockResolvedValueOnce(profileRow)
      .mockResolvedValueOnce({ ...profileRow, address: null });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const response = await createProfilePatch({
      user: { findFirst, updateMany },
    })(jsonRequest("PATCH", { address: "   " }), { user: { id: "user-1" } });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ address: null });
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { address: null },
    }));
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
  it("falls back to owned database storage when R2 configuration is absent", async () => {
    const database = { mediaAsset: { create: vi.fn(async ({ data }) => data) } };
    const response = await createUploadSignPost({ storage: unavailableStorage, database })(
      jsonRequest("POST", imageInput), { user: { id: "user-1" } },
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      storageProvider: "DATABASE",
      uploadUrl: expect.stringMatching(/\/api\/uploads\/.+\/data$/),
      publicUrl: expect.stringMatching(/\/api\/media\/.+$/),
      headers: { "content-type": "image/webp" },
    });
    expect(database.mediaAsset.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ ownerId: "user-1", storageProvider: "DATABASE" }),
    }));
  });

  it("creates an owned post-image asset only for a 4 MiB-or-smaller image", async () => {
    const database = { mediaAsset: { create: vi.fn(async ({ data }) => ({ id: data.id, ...data })) } };
    const response = await createUploadSignPost({ storage: configuredStorage, database })(
      jsonRequest("POST", { ...imageInput, bytes: 4194304, mimeType: "image/webp" }),
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

  it("rejects an image larger than 4 MiB before persisting an asset", async () => {
    const database = { mediaAsset: { create: vi.fn() } };
    const response = await createUploadSignPost({ storage: configuredStorage, database })(
      jsonRequest("POST", { ...imageInput, bytes: 4194305 }),
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

describe("Blindly database image upload API", () => {
  const assetId = "9cd87ddd-5890-467d-8feb-17c83f432111";
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);

  it("stores a valid owned image and marks it verified", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = { mediaAsset: {
      findFirst: vi.fn().mockResolvedValue({ id: assetId, bytes: webp.byteLength, mimeType: "image/webp" }),
      updateMany,
    } };
    const response = await createDatabaseUploadPut(database)(
      new Request(`http://localhost/api/uploads/${assetId}/data`, {
        method: "PUT",
        headers: { "content-type": "image/webp" },
        body: webp,
      }),
      { user: { id: "user-1" }, params: Promise.resolve({ id: assetId }) },
    );
    expect(response.status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ data: expect.any(Uint8Array), verifiedAt: expect.any(Date) }),
    }));
  });

  it("accepts any positive portrait and landscape image dimensions", async () => {
    const database = { mediaAsset: { create: vi.fn(async ({ data }) => ({ id: data.id, ...data })) } };
    const portrait = await createUploadSignPost({ storage: configuredStorage, database })(
      jsonRequest("POST", { ...imageInput, width: 1, height: 120000 }),
      { user: { id: "user-1" } },
    );
    const landscape = await createUploadSignPost({ storage: configuredStorage, database })(
      jsonRequest("POST", { ...imageInput, width: 120000, height: 1 }),
      { user: { id: "user-1" } },
    );

    expect(portrait.status).toBe(201);
    expect(landscape.status).toBe(201);
  });

  it("rejects bytes whose image signature does not match", async () => {
    const updateMany = vi.fn();
    const database = { mediaAsset: {
      findFirst: vi.fn().mockResolvedValue({ id: assetId, bytes: webp.byteLength, mimeType: "image/webp" }),
      updateMany,
    } };
    const response = await createDatabaseUploadPut(database)(
      new Request(`http://localhost/api/uploads/${assetId}/data`, {
        method: "PUT",
        headers: { "content-type": "image/webp" },
        body: new Uint8Array(webp.byteLength),
      }),
      { user: { id: "user-1" }, params: Promise.resolve({ id: assetId }) },
    );
    expect(response.status).toBe(400);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("does not expose an unowned or unavailable upload", async () => {
    const database = { mediaAsset: { findFirst: vi.fn().mockResolvedValue(null) } };
    const response = await createDatabaseUploadPut(database)(
      new Request(`http://localhost/api/uploads/${assetId}/data`, {
        method: "PUT",
        headers: { "content-type": "image/webp" },
        body: webp,
      }),
      { user: { id: "user-1" }, params: Promise.resolve({ id: assetId }) },
    );
    expect(response.status).toBe(404);
  });

  it("serves only a verified database image with immutable headers", async () => {
    const database = { mediaAsset: { findFirst: vi.fn().mockResolvedValue({ data: webp, mimeType: "image/webp" }) } };
    const response = await createMediaGet(database)(
      new Request(`http://localhost/api/media/${assetId}`),
      { params: Promise.resolve({ id: assetId }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(webp);
  });
});

describe("Blindly Bunny image storage", () => {
  const assetId = "9cd87ddd-5890-467d-8feb-17c83f432111";
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);

  it("selects Bunny before R2 and returns only a same-origin upload URL", async () => {
    const bunny = {
      getBunnyStorageConfiguration: () => ({ configured: true }),
      buildObjectKey: ({ ownerId, assetId, extension }) => `users/${ownerId}/${assetId}.${extension}`,
      buildPublicUrl: (key) => `https://blindly-media.b-cdn.net/${key}`,
    };
    const database = { mediaAsset: { create: vi.fn(async ({ data }) => data) } };
    const response = await createUploadSignPost({ bunny, storage: configuredStorage, database })(
      jsonRequest("POST", imageInput), { user: { id: "user-1" } },
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toMatchObject({
      storageProvider: "BUNNY",
      uploadUrl: expect.stringMatching(/^http:\/\/localhost\/api\/uploads\/.+\/data$/),
      publicUrl: expect.stringMatching(/^https:\/\/blindly-media\.b-cdn\.net\/users\/user-1\//),
    });
    expect(JSON.stringify(payload)).not.toContain("AccessKey");
  });

  it("uploads verified bytes through the regional Bunny Storage API without exposing its key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 201 });
    await uploadBunnyObject({
      key: "users/user-1/asset.webp",
      mimeType: "image/webp",
      body: webp,
      env: {
        BUNNY_STORAGE_ZONE: "blindly-media",
        BUNNY_STORAGE_ACCESS_KEY: "storage-secret",
        BUNNY_STORAGE_HOSTNAME: "sg.storage.bunnycdn.com",
        BUNNY_CDN_BASE_URL: "https://blindly-media.b-cdn.net",
      },
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://sg.storage.bunnycdn.com/blindly-media/users/user-1/asset.webp",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          AccessKey: "storage-secret",
          "Content-Type": "image/webp",
          Checksum: expect.stringMatching(/^[A-F0-9]{64}$/),
        }),
      }),
    );
  });

  it("proxies an owned image to Bunny and stores only its CDN URL in PostgreSQL", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const bunny = { uploadObject: vi.fn().mockResolvedValue({}) };
    const database = { mediaAsset: {
      findFirst: vi.fn().mockResolvedValue({
        id: assetId,
        key: `users/user-1/${assetId}.webp`,
        bytes: webp.byteLength,
        mimeType: "image/webp",
        storageProvider: "BUNNY",
      }),
      updateMany,
    } };
    const response = await createUploadDataPut({ database, bunny })(
      new Request(`http://localhost/api/uploads/${assetId}/data`, {
        method: "PUT",
        headers: { "content-type": "image/webp" },
        body: webp,
      }),
      { user: { id: "user-1" }, params: Promise.resolve({ id: assetId }) },
    );

    expect(response.status).toBe(200);
    expect(bunny.uploadObject).toHaveBeenCalledWith(expect.objectContaining({
      key: `users/user-1/${assetId}.webp`,
      mimeType: "image/webp",
      body: expect.any(Uint8Array),
    }));
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { verifiedAt: expect.any(Date) },
    }));
  });
});

describe("Blindly Bunny Stream video storage", () => {
  const videoInput = {
    fileName: "launch.mp4",
    mimeType: "video/mp4",
    bytes: 80 * 1024 * 1024,
    kind: "post",
  };

  it("creates expiring TUS credentials without returning the Stream API key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ guid: "video-guid-1" }),
    });
    const intent = await createVideoUploadIntent({
      title: "launch.mp4",
      env: { BUNNY_STREAM_LIBRARY_ID: "12345", BUNNY_STREAM_API_KEY: "stream-secret" },
      now: () => 1_780_000_000_000,
      fetchImpl,
    });

    expect(intent).toMatchObject({
      videoId: "video-guid-1",
      uploadUrl: "https://video.bunnycdn.com/tusupload",
      uploadProtocol: "tus",
      publicUrl: "https://iframe.mediadelivery.net/embed/12345/video-guid-1",
      headers: {
        LibraryId: "12345",
        VideoId: "video-guid-1",
        AuthorizationSignature: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
    });
    expect(JSON.stringify(intent)).not.toContain("stream-secret");
  });

  it("creates an owned Bunny Stream media asset for a large video", async () => {
    const stream = {
      getBunnyStreamConfiguration: () => ({ configured: true }),
      createVideoUploadIntent: vi.fn().mockResolvedValue({
        videoId: "video-guid-1",
        uploadUrl: "https://video.bunnycdn.com/tusupload",
        uploadProtocol: "tus",
        publicUrl: "https://iframe.mediadelivery.net/embed/12345/video-guid-1",
        headers: { AuthorizationSignature: "signature", AuthorizationExpire: "1780003600", LibraryId: "12345", VideoId: "video-guid-1" },
      }),
      deleteVideo: vi.fn(),
    };
    const database = { mediaAsset: { create: vi.fn(async ({ data }) => data) } };
    const response = await createUploadSignPost({ stream, database })(
      jsonRequest("POST", videoInput), { user: { id: "user-1" } },
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ uploadProtocol: "tus", storageProvider: "BUNNY_STREAM", videoId: "video-guid-1" });
    expect(database.mediaAsset.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ storageProvider: "BUNNY_STREAM", mimeType: "video/mp4", bytes: videoInput.bytes }),
    }));
  });

  it("verifies a completed Bunny Stream upload before it can become a post", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const stream = {
      getBunnyStreamConfiguration: () => ({ configured: true }),
      getVideo: vi.fn().mockResolvedValue({ status: 2 }),
    };
    const database = { mediaAsset: {
      findFirst: vi.fn().mockResolvedValue({
        id: "9cd87ddd-5890-467d-8feb-17c83f432111",
        key: "bunny-stream/video-guid-1",
        publicUrl: "https://iframe.mediadelivery.net/embed/12345/video-guid-1",
        mimeType: "video/mp4",
        bytes: videoInput.bytes,
        verifiedAt: null,
        storageProvider: "BUNNY_STREAM",
      }),
      updateMany,
    } };
    const response = await createUploadCompletePost({ stream, database })(
      jsonRequest("POST", { assetId: "9cd87ddd-5890-467d-8feb-17c83f432111" }),
      { user: { id: "user-1" } },
    );

    expect(response.status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { verifiedAt: expect.any(Date) } }));
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
      getObjectPrefix: vi.fn().mockResolvedValue(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])),
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
