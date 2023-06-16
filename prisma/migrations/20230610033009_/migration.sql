/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviteLink` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Organisation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IGCategory" AS ENUM ('Sports', 'SocioCultural', 'Others', 'Inactive', 'Guips');

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "category" "IGCategory" NOT NULL,
                           ADD COLUMN     "inviteLink" TEXT NOT NULL,
                           ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");
