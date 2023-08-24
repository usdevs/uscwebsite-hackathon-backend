-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookedForOrgId" INTEGER;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookedForOrgId_fkey" FOREIGN KEY ("bookedForOrgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
