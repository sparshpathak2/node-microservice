/*
  Warnings:

  - You are about to drop the column `slug` on the `Module` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Module_slug_idx";

-- DropIndex
DROP INDEX "Module_slug_key";

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "slug";
