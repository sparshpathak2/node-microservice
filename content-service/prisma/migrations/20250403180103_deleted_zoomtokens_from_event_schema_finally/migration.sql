/*
  Warnings:

  - You are about to drop the column `zoomAccessToken` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `zoomRefreshToken` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `zoomTokenExpiresAt` on the `Events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "zoomAccessToken",
DROP COLUMN "zoomRefreshToken",
DROP COLUMN "zoomTokenExpiresAt";
