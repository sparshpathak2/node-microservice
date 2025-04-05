/*
  Warnings:

  - A unique constraint covering the columns `[name,communityId]` on the table `Space` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spaceTypeId` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "spaceTypeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SpaceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SpaceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpaceType_name_key" ON "SpaceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Space_name_communityId_key" ON "Space"("name", "communityId");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_spaceTypeId_fkey" FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
