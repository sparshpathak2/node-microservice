/*
  Warnings:

  - You are about to drop the column `text` on the `Option` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correctOptionId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `option` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `question` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Option" DROP COLUMN "text",
ADD COLUMN     "option" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "question",
ADD COLUMN     "question" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "resumedAt" TIMESTAMP(3),
ADD COLUMN     "totalElapsedSeconds" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "score" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Question_correctOptionId_key" ON "Question"("correctOptionId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_correctOptionId_fkey" FOREIGN KEY ("correctOptionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
