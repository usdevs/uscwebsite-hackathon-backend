import prisma from './db'
import { IGCategory, Organisation, Prisma, UserOnOrg } from "@prisma/client";
import { HttpCode, HttpException } from "@exceptions/HttpException";
import { checkIsUserAdmin } from "@middlewares/checks";
import { getSlugFromIgName } from "@/config/common";

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

export async function getAllOrgCategories(): Promise<any> {
  return IGCategory;
}

type UserId = {
  userId: number
}

export type OrganisationPayload = Pick<
  Organisation,
  'name' | 'description' | 'verified' | 'inviteLink' | 'category' | 'isInvisible' | 'isInactive'
> & UserId

/* Add a new organisation */
export async function addOrg(orgPayload: OrganisationPayload): Promise<Organisation> {
  if (!(await checkIsUserAdmin(orgPayload.userId))) {
    throw new HttpException(
      `You are not an admin.`,
      HttpCode.Forbidden
    )
  }
  const orgToAdd: Prisma.OrganisationCreateInput = {...orgPayload, slug: getSlugFromIgName(orgPayload.name)}
  return prisma.organisation.create({ data: orgToAdd });
}

/**
 * Update an existing organisation
 *
 * @param orgId
 * @param orgPayload
 * @returns updated organisation
 */
export async function updateOrg(
  orgId: Organisation['id'],
  orgPayload: OrganisationPayload,
): Promise<Organisation> {
  const orgToUpdate = await prisma.organisation.findUnique({
    where: {
      id: orgId,
    },
  })

  if (!orgToUpdate) {
    throw new HttpException(
      `Could not find org with id ${orgId}`,
      HttpCode.BadRequest
    )
  }

  const isUserAdmin = await checkIsUserAdmin(orgPayload.userId)

  const userOnOrg = await prisma.userOnOrg.findFirst({
    where: { userId: orgPayload.userId, orgId: orgId },
  })
  if (!userOnOrg || !isUserAdmin) {
    throw new HttpException(
      `You are neither a member of this organisation nor an admin.`,
      HttpCode.Forbidden
    )
  }
  const updatedOrg: Prisma.OrganisationUpdateInput = {...orgPayload, slug: getSlugFromIgName(orgPayload.name)}

  return prisma.organisation.update({
    where: {
      id: orgId,
    },
    data: updatedOrg,
  });
}

/* Delete an existing org */
export async function deleteOrg(
  orgId: Organisation['id'],
  userId: UserOnOrg['userId']
): Promise<Organisation> {
  const bookingToDelete = await prisma.booking.findFirst({
    where: {
      id: orgId,
    },
  })
  if (!bookingToDelete) {
    throw new HttpException(
      `Could not find org with id ${orgId}`,
      HttpCode.BadRequest
    )
  }

  const isUserAdmin = await checkIsUserAdmin(userId)

  const userOnOrg = await prisma.userOnOrg.findFirst({
    where: {
      userId,
      orgId: orgId
    },
  })

  if (!userOnOrg || !isUserAdmin) {
    throw new HttpException(
      `You are neither a member of this organisation nor an admin.`,
      HttpCode.Forbidden
    )
  }
  return prisma.organisation.delete({
    where: {
      id: orgId,
    },
  });
}
