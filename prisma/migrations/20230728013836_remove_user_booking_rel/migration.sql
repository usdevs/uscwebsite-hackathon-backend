-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_venueId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnOrg" DROP CONSTRAINT "UserOnOrg_orgId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnOrg" DROP CONSTRAINT "UserOnOrg_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserOnOrg" ADD CONSTRAINT "UserOnOrg_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnOrg" ADD CONSTRAINT "UserOnOrg_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_orgId_fkey" FOREIGN KEY ("userId", "orgId") REFERENCES "UserOnOrg"("userId", "orgId") ON DELETE CASCADE ON UPDATE CASCADE;
