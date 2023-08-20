import { prisma } from '../../db'
import { Prisma } from "@prisma/client";

/* Retrieves all venues */
export async function getAllVenues(): Promise<Prisma.VenueGetPayload<Prisma.VenueArgs>[]> {
  return prisma.venue.findMany();
}
