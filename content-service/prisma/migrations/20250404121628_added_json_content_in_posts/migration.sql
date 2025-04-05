/*
  Warnings:

  - You are about to drop the column `text` on the `Posts` table. All the data in the column will be lost.
  - Added the required column `content` to the `Posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "text",
ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
