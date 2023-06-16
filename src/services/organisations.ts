import prisma from './db'
import { Prisma } from "@prisma/client";

type OrganisationsWithIGHeads = Prisma.OrganisationGetPayload<{
  include: {
    userOrg: {
      include: {
        user: true
      }
    }
  };
}>;


/* Retrieves all organisations */
export async function getAllOrgs(): Promise<OrganisationsWithIGHeads[]> {
  return prisma.organisation.findMany({
    include: {
      userOrg: {
        include: {
          user: true
        }
      }
    }
  });
}
