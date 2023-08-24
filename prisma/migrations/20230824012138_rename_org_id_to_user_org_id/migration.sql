/*
  Warnings:

  - You are about to drop the column `orgId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `userOrgId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_orgId_fkey";

-- AlterTable
ALTER TABLE "Booking" RENAME COLUMN "orgId" to "userOrgId";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_userOrgId_fkey" FOREIGN KEY ("userId", "userOrgId") REFERENCES "UserOnOrg"("userId", "orgId") ON DELETE CASCADE ON UPDATE CASCADE;
