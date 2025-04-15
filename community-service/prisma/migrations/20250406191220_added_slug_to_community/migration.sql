/*
  Warnings:

  - A unique constraint covering the columns `[userId,communityId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_communityId_key" ON "Membership"("userId", "communityId");
