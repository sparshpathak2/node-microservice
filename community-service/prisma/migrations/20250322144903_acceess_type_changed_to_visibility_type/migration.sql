/*
  Warnings:

  - The `accessType` column on the `Space` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `accessType` on the `SpaceGroup` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SpaceVisibility" AS ENUM ('OPEN', 'SECRET');

-- AlterTable
ALTER TABLE "Space" DROP COLUMN "accessType",
ADD COLUMN     "accessType" "SpaceVisibility" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "SpaceGroup" DROP COLUMN "accessType",
ADD COLUMN     "visibilityType" "SpaceVisibility" NOT NULL DEFAULT 'OPEN';

-- DropEnum
DROP TYPE "SpaceAccess";
