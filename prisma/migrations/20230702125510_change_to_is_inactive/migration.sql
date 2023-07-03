/*
  Warnings:

  - You are about to drop the column `isActive` on the `Organisation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "isActive",
ADD COLUMN     "isInactive" BOOLEAN NOT NULL DEFAULT false;
