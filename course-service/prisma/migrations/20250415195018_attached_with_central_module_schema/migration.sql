/*
  Warnings:

  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Quiz` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[moduleId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moduleId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_lessonId_fkey";

-- DropIndex
DROP INDEX "Quiz_lessonId_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "price",
ADD COLUMN     "moduleId" TEXT NOT NULL,
ALTER COLUMN "spaceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "moduleId" TEXT NOT NULL,
ALTER COLUMN "courseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "createdById",
DROP COLUMN "lessonId",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "moduleId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_moduleId_key" ON "Quiz"("moduleId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
