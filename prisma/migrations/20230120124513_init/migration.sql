/*
  Warnings:

  - A unique constraint covering the columns `[telegramId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "UserDisplayImage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDisplayImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgDisplayImage" (
    "id" SERIAL NOT NULL,
    "orgId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgDisplayImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDisplayImage_userId_key" ON "UserDisplayImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgDisplayImage_orgId_key" ON "OrgDisplayImage"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- AddForeignKey
ALTER TABLE "UserDisplayImage" ADD CONSTRAINT "UserDisplayImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDisplayImage" ADD CONSTRAINT "OrgDisplayImage_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
