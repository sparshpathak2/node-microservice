/*
  Warnings:

  - You are about to drop the column `description` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `parentModuleId` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `spaceId` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Module` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Module` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hostId` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Made the column `hostType` on table `Module` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_parentModuleId_fkey";

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "description",
DROP COLUMN "parentModuleId",
DROP COLUMN "spaceId",
DROP COLUMN "title",
ADD COLUMN     "hostId" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "hostType" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Module_slug_key" ON "Module"("slug");
