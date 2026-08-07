import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { validImageSignature } from "@/lib/storage/image-validation";
import * as bunnyStorage from "@/lib/storage/bunny";

const MAX_BYTES = 4 * 1024 * 1024;

export function createUploadDataPut({ database = db, bunny = bunnyStorage } = {}) {
  return async (req, { user, params }) => {
    const { id } = await params;
    const asset = await database.mediaAsset.findFirst({
      where: { id, ownerId: user.id, storageProvider: { in: ["DATABASE", "BUNNY"] }, deletedAt: null, verifiedAt: null },
      select: { id: true, key: true, bytes: true, mimeType: true, storageProvider: true },
    });
    if (!asset) return NextResponse.json({ error: "Upload asset not found" }, { status: 404 });
    if (asset.bytes > MAX_BYTES) return NextResponse.json({ error: "Images must be 4 MiB or smaller" }, { status: 413 });
    if (req.headers.get("content-type") !== asset.mimeType) return NextResponse.json({ error: "Uploaded image type did not match" }, { status: 400 });

    const data = new Uint8Array(await req.arrayBuffer());
    if (data.byteLength !== asset.bytes || !validImageSignature(asset.mimeType, data.slice(0, 16))) {
      return NextResponse.json({ error: "Uploaded image did not match the signed metadata" }, { status: 400 });
    }
    const provider = asset.storageProvider || "DATABASE";
    try {
      if (provider === "BUNNY") {
        await bunny.uploadObject({ key: asset.key, mimeType: asset.mimeType, body: data });
      }
    } catch {
      return NextResponse.json({ error: "Bunny Storage upload failed. Please retry" }, { status: 502 });
    }
    const updated = await database.mediaAsset.updateMany({
      where: { id: asset.id, ownerId: user.id, storageProvider: provider, deletedAt: null, verifiedAt: null },
      data: { ...(provider === "DATABASE" ? { data } : {}), verifiedAt: new Date() },
    });
    if (updated.count === 0) return NextResponse.json({ error: "Upload asset is no longer available" }, { status: 409 });
    return NextResponse.json({ assetId: asset.id, verified: true });
  };
}

export const createDatabaseUploadPut = (database = db) => createUploadDataPut({ database });

export const PUT = withAuth(createUploadDataPut());
