import { db } from "@/lib/db";

export function createMediaGet(database = db) {
  return async (_req, { params }) => {
    const { id } = await params;
    const asset = await database.mediaAsset.findFirst({
      where: { id, storageProvider: "DATABASE", deletedAt: null, verifiedAt: { not: null }, data: { not: null } },
      select: { data: true, mimeType: true },
    });
    if (!asset) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(asset.data), {
      headers: {
        "Content-Type": asset.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  };
}

export const GET = createMediaGet();
