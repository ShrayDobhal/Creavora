import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { uploadSignSchema, validateBody } from "@/lib/validators";
import * as r2Storage from "@/lib/storage/r2";
import * as bunnyStorage from "@/lib/storage/bunny";
import * as bunnyStream from "@/lib/storage/bunny-stream";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const validationResponse = (details, status = 400) =>
  NextResponse.json({ error: "Validation failed", details }, { status });

export function createUploadSignPost({ storage = r2Storage, bunny = bunnyStorage, stream = bunnyStream, database = db } = {}) {
  return async (req, { user }) => {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to read upload request" }, { status: 500 });
    }

    if (body?.mimeType?.startsWith("image/") && typeof body?.bytes === "number" && body.bytes > MAX_IMAGE_BYTES) {
      return validationResponse([{ field: "bytes", message: "Image must be 4 MiB or smaller" }], 413);
    }

    const { error, data } = validateBody(uploadSignSchema, body);
    if (error) return validationResponse(error);

    if (data.mimeType.startsWith("video/")) {
      if (!stream.getBunnyStreamConfiguration().configured) {
        return NextResponse.json({ error: "Video uploads are not configured yet" }, { status: 503 });
      }
      let intent;
      try {
        intent = await stream.createVideoUploadIntent({ title: data.fileName });
        const assetId = randomUUID();
        await database.mediaAsset.create({
          data: {
            id: assetId,
            ownerId: user.id,
            key: `bunny-stream/${intent.videoId}`,
            publicUrl: intent.publicUrl,
            mimeType: data.mimeType,
            bytes: data.bytes,
            width: data.width,
            height: data.height,
            kind: data.kind,
            storageProvider: "BUNNY_STREAM",
          },
        });
        return NextResponse.json({
          assetId,
          videoId: intent.videoId,
          uploadUrl: intent.uploadUrl,
          uploadProtocol: intent.uploadProtocol,
          publicUrl: intent.publicUrl,
          headers: intent.headers,
          metadata: { filetype: data.mimeType, title: data.fileName },
          storageProvider: "BUNNY_STREAM",
        }, { status: 201 });
      } catch {
        if (intent?.videoId) {
          try { await stream.deleteVideo({ videoId: intent.videoId }); } catch { /* Preserve the upload error. */ }
        }
        console.error("Failed to create Bunny Stream upload intent");
        return NextResponse.json({ error: "Failed to prepare video upload" }, { status: 500 });
      }
    }

    const useBunnyStorage = bunny.getBunnyStorageConfiguration().configured;
    const useR2Storage = !useBunnyStorage && storage.getR2Configuration().configured;
    const storageProvider = useBunnyStorage ? "BUNNY" : useR2Storage ? "R2" : "DATABASE";
    const assetId = randomUUID();
    const extension = extensions[data.mimeType];
    const key = storageProvider === "DATABASE"
      ? `database/${assetId}.${extension}`
      : (useBunnyStorage ? bunny : storage).buildObjectKey({ ownerId: user.id, assetId, extension });
    const publicUrl = storageProvider === "DATABASE"
      ? new URL(`/api/media/${assetId}`, req.url).toString()
      : (useBunnyStorage ? bunny : storage).buildPublicUrl(key);

    let persisted = false;
    try {
      await database.mediaAsset.create({
        data: {
          id: assetId,
          ownerId: user.id,
          key,
          publicUrl,
          mimeType: data.mimeType,
          bytes: data.bytes,
          width: data.width,
          height: data.height,
          kind: data.kind,
          storageProvider,
        },
      });
      persisted = true;

      if (storageProvider === "DATABASE" || storageProvider === "BUNNY") {
        return NextResponse.json({
          assetId,
          key,
          uploadUrl: new URL(`/api/uploads/${assetId}/data`, req.url).toString(),
          publicUrl,
          headers: { "content-type": data.mimeType },
          storageProvider,
        }, { status: 201 });
      }

      const intent = await storage.createUploadIntent({
        ownerId: user.id,
        assetId,
        extension,
        mimeType: data.mimeType,
      });
      if (
        intent?.assetId !== assetId
        || intent.key !== key
        || intent.publicUrl !== publicUrl
        || intent.headers?.["content-type"] !== data.mimeType
        || intent.headers?.["if-none-match"] !== "*"
        || typeof intent.uploadUrl !== "string"
      ) {
        throw new Error("Signed upload intent did not match the persisted asset");
      }
      return NextResponse.json({
        assetId,
        key,
        uploadUrl: intent.uploadUrl,
        publicUrl,
        headers: { "content-type": data.mimeType, "if-none-match": "*" },
      }, { status: 201 });
    } catch (error) {
      if (persisted && database.mediaAsset.update) {
        try {
          await database.mediaAsset.update({
            where: { id: assetId },
            data: { deletedAt: new Date() },
          });
        } catch {
          // Preserve the original error response when cleanup cannot run.
        }
      }
      console.error("Failed to create image upload intent");
      return NextResponse.json({ error: "Failed to create image upload intent" }, { status: 500 });
    }
  };
}

export const POST = withAuth(createUploadSignPost());
