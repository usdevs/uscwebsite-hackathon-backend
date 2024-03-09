-- CreateTable
CREATE TABLE "VenueAdminRole" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "VenueAdminRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VenueAdminRole" ADD CONSTRAINT "VenueAdminRole_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueAdminRole" ADD CONSTRAINT "VenueAdminRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
