import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { uploadCompleteSchema, validateBody } from "@/lib/validators";
import * as r2Storage from "@/lib/storage/r2";
import { validImageSignature } from "@/lib/storage/image-validation";

const INVALID_UPLOAD = "Uploaded image did not match the signed metadata";

const validationResponse = (details) =>
  NextResponse.json({ error: "Validation failed", details }, { status: 400 });

export function createUploadCompletePost({ storage = r2Storage, database = db } = {}) {
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

    const { error, data } = validateBody(uploadCompleteSchema, body);
    if (error) return validationResponse(error);

    const asset = await database.mediaAsset.findFirst({
      where: { id: data.assetId, ownerId: user.id, deletedAt: null },
      select: { id: true, key: true, publicUrl: true, mimeType: true, bytes: true, verifiedAt: true, storageProvider: true },
    });
    if (!asset) return NextResponse.json({ error: "Upload asset not found" }, { status: 404 });
    if (asset.verifiedAt) {
      return NextResponse.json({ assetId: asset.id, publicUrl: asset.publicUrl, verified: true });
    }
    if (asset.storageProvider === "DATABASE") {
      return NextResponse.json({ error: "Upload has not finished yet" }, { status: 409 });
    }
    if (!storage.getR2Configuration().configured) {
      return NextResponse.json({ error: "Image upload storage is temporarily unavailable" }, { status: 503 });
    }

    try {
      const metadata = await storage.getObjectMetadata({ key: asset.key });
      const prefix = metadata.ContentLength === asset.bytes && metadata.ContentType === asset.mimeType
        ? await storage.getObjectPrefix({ key: asset.key })
        : null;
      if (metadata.ContentLength !== asset.bytes || metadata.ContentType !== asset.mimeType || !validImageSignature(asset.mimeType, prefix)) {
        await database.mediaAsset.updateMany({
          where: { id: asset.id, ownerId: user.id, deletedAt: null, verifiedAt: null },
          data: { deletedAt: new Date() },
        });
        return NextResponse.json({ error: INVALID_UPLOAD }, { status: 400 });
      }

      const activated = await database.mediaAsset.updateMany({
        where: { id: asset.id, ownerId: user.id, deletedAt: null, verifiedAt: null },
        data: { verifiedAt: new Date() },
      });
      if (activated.count === 0) {
        return NextResponse.json({ error: "Upload asset is no longer available" }, { status: 409 });
      }
      return NextResponse.json({ assetId: asset.id, publicUrl: asset.publicUrl, verified: true });
    } catch {
      console.error("Failed to verify uploaded image");
      return NextResponse.json({ error: "Failed to verify uploaded image" }, { status: 500 });
    }
  };
}

export const POST = withAuth(createUploadCompletePost());
