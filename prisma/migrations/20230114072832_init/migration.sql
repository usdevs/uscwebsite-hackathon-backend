/*
  Warnings:

  - The `telegramId` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[telegramId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "imageId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageId" TEXT,
DROP COLUMN "telegramId",
ADD COLUMN     "telegramId" INTEGER;

-- CreateTable
CREATE TABLE "DisplayImage" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "version" TEXT NOT NULL,

    CONSTRAINT "DisplayImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DisplayImage_publicId_key" ON "DisplayImage"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "DisplayImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "DisplayImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
