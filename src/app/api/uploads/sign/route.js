import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { uploadSignSchema, validateBody } from "@/lib/validators";
import * as r2Storage from "@/lib/storage/r2";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const validationResponse = (details, status = 400) =>
  NextResponse.json({ error: "Validation failed", details }, { status });

export function createUploadSignPost({ storage = r2Storage, database = db } = {}) {
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

    if (typeof body?.bytes === "number" && body.bytes > MAX_IMAGE_BYTES) {
      return validationResponse([{ field: "bytes", message: "Image must be 5 MiB or smaller" }], 413);
    }

    const { error, data } = validateBody(uploadSignSchema, body);
    if (error) return validationResponse(error);

    if (!storage.getR2Configuration().configured) {
      return NextResponse.json({ error: "Image uploads are not configured yet" }, { status: 503 });
    }

    const assetId = randomUUID();
    const extension = extensions[data.mimeType];
    const key = storage.buildObjectKey({ ownerId: user.id, assetId, extension });
    const publicUrl = storage.buildPublicUrl(key);

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
        },
      });
      persisted = true;

      const intent = await storage.createUploadIntent({
        ownerId: user.id,
        assetId,
        extension,
        mimeType: data.mimeType,
      });
      return NextResponse.json(intent, { status: 201 });
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
