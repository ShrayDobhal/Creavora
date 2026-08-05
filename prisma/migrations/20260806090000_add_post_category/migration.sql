ALTER TABLE "Post" ADD COLUMN "category" TEXT;

CREATE INDEX "Post_category_idx" ON "Post"("category");
