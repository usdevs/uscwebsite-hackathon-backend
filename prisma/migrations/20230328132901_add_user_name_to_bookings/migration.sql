/*
  Warnings:

  - Added the required column `bookedByName` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookedByName" TEXT NOT NULL;
