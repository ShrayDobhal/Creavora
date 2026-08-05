import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { uploadCompleteSchema, validateBody } from "@/lib/validators";
import * as r2Storage from "@/lib/storage/r2";

const INVALID_UPLOAD = "Uploaded image did not match the signed metadata";
const validSignature = (mimeType, bytes) => {
  const value = Array.from(bytes || []);
  if (mimeType === "image/jpeg") return value[0] === 0xff && value[1] === 0xd8 && value[2] === 0xff;
  if (mimeType === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => value[index] === byte);
  if (mimeType === "image/webp") return String.fromCharCode(...value.slice(0, 4)) === "RIFF" && String.fromCharCode(...value.slice(8, 12)) === "WEBP";
  return false;
};

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

    if (!storage.getR2Configuration().configured) {
      return NextResponse.json({ error: "Image uploads are not configured yet" }, { status: 503 });
    }

    const asset = await database.mediaAsset.findFirst({
      where: { id: data.assetId, ownerId: user.id, deletedAt: null },
      select: { id: true, key: true, publicUrl: true, mimeType: true, bytes: true, verifiedAt: true },
    });
    if (!asset) return NextResponse.json({ error: "Upload asset not found" }, { status: 404 });
    if (asset.verifiedAt) {
      return NextResponse.json({ assetId: asset.id, publicUrl: asset.publicUrl, verified: true });
    }

    try {
      const metadata = await storage.getObjectMetadata({ key: asset.key });
      const prefix = metadata.ContentLength === asset.bytes && metadata.ContentType === asset.mimeType
        ? await storage.getObjectPrefix({ key: asset.key })
        : null;
      if (metadata.ContentLength !== asset.bytes || metadata.ContentType !== asset.mimeType || !validSignature(asset.mimeType, prefix)) {
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
