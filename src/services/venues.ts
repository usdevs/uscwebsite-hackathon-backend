import { prisma } from '../../db'
import { Prisma, Role } from '@prisma/client'

/* Retrieves all venues */
export async function getAllVenues(): Promise<
  Prisma.VenueGetPayload<Prisma.VenueArgs>[]
> {
  return prisma.venue.findMany()
}

/* Retrieves the roles for a venue */
export const getVenueRoles = async (venueId: number): Promise<Role[]> => {
  const venueRoles = await prisma.venueAdminRole.findMany({
    where: {
      venueId: venueId,
    },
    select: {
      role: true,
    },
  })
  const roles = venueRoles.flatMap((venueRole) => venueRole.role)
  return roles
}
