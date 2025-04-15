/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Space` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "SpaceMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "role" TEXT,
    "status" "MembershipStatus" DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpaceMembership_userId_spaceId_key" ON "SpaceMembership"("userId", "spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Space_slug_key" ON "Space"("slug");

-- AddForeignKey
ALTER TABLE "SpaceMembership" ADD CONSTRAINT "SpaceMembership_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
