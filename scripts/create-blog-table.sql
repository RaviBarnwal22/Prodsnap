-- Creates the blog's BlogPost table. Run once in the Supabase dashboard:
-- SQL Editor, paste, Run. Generated from prisma/schema.prisma with
-- `prisma migrate diff`, so it is exactly what `npx prisma db push` would do.
-- Purely additive: no existing table is touched.

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT,
    "contentHtml" TEXT NOT NULL DEFAULT '',
    "seriesName" TEXT,
    "seriesPart" INTEGER,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "readingMinutes" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_seriesName_idx" ON "BlogPost"("seriesName");


-- Keep the public Supabase key from reading or writing this table directly.
-- The site reads it through Prisma as the table owner, which RLS does not affect.
ALTER TABLE "BlogPost" ENABLE ROW LEVEL SECURITY;
