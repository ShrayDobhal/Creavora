-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "location" TEXT,
  ADD COLUMN "website" TEXT,
  ADD COLUMN "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC';

-- CreateTable
CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "ownerId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "publicUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "bytes" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "kind" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_key_key" ON "MediaAsset"("key");
CREATE UNIQUE INDEX "MediaAsset_publicUrl_key" ON "MediaAsset"("publicUrl");
CREATE INDEX "MediaAsset_ownerId_kind_idx" ON "MediaAsset"("ownerId", "kind");

-- AddForeignKey
ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
