/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Community` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Community` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Community" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
