/*
  Warnings:

  - Added the required column `telegramUserName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telegramDpUrl" TEXT,
ADD COLUMN     "telegramId" TEXT,
ADD COLUMN     "telegramUserName" TEXT NOT NULL;
