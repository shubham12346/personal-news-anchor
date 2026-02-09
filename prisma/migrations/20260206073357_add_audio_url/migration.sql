/*
  Warnings:

  - You are about to drop the column `articles` on the `Broadcast` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "articles",
ADD COLUMN     "audioUrl" TEXT;
