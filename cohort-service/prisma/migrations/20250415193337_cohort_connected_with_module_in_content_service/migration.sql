/*
  Warnings:

  - You are about to drop the column `cohortId` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `contentId` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Cohort` table. All the data in the column will be lost.
  - You are about to drop the column `spaceId` on the `Cohort` table. All the data in the column will be lost.
  - You are about to drop the column `cohortId` on the `DiscussionThread` table. All the data in the column will be lost.
  - You are about to drop the column `contentId` on the `DiscussionThread` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[moduleId]` on the table `Cohort` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moduleId]` on the table `DiscussionThread` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moduleId` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `Cohort` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `DiscussionThread` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_cohortId_fkey";

-- DropForeignKey
ALTER TABLE "DiscussionThread" DROP CONSTRAINT "DiscussionThread_cohortId_fkey";

-- DropIndex
DROP INDEX "Cohort_slug_key";

-- DropIndex
DROP INDEX "DiscussionThread_contentId_key";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "cohortId",
DROP COLUMN "contentId",
ADD COLUMN     "moduleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Cohort" DROP COLUMN "slug",
DROP COLUMN "spaceId",
ADD COLUMN     "moduleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DiscussionThread" DROP COLUMN "cohortId",
DROP COLUMN "contentId",
ADD COLUMN     "moduleId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cohort_moduleId_key" ON "Cohort"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscussionThread_moduleId_key" ON "DiscussionThread"("moduleId");
