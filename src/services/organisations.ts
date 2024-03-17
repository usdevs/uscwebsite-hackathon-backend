import { getSlugFromIgName } from '@/config/common'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import {
  Booking,
  IGCategory,
  Organisation,
  Prisma,
  User,
  UserOnOrg,
} from '@prisma/client'
import { prisma } from '../../db'

/**
 * A type alias for an {@link Organisation} with its IG head (i.e. a {@link User})
 */
export type OrganisationWithIGHead = Prisma.OrganisationGetPayload<{
  include: {
    userOrg: {
      include: {
        user: true
      }
    }
  }
}>

/* Retrieves all organisations */
export async function getAllOrgs(): Promise<OrganisationWithIGHead[]> {
  return prisma.organisation.findMany({
    include: {
      userOrg: {
        include: {
          user: true,
        },
      },
    },
  })
}

export async function getAllOrgCategories(): Promise<any> {
  return IGCategory
}

type UserId = {
  userId: number
}

type OrgMembers = {
  igHead: number
  otherMembers: number[]
}

export type OrganisationPayload = Pick<
  Organisation,
  | 'name'
  | 'description'
  | 'isAdminOrg'
  | 'inviteLink'
  | 'category'
  | 'isInvisible'
  | 'isInactive'
> &
  UserId &
  OrgMembers

/**
 * Upsert an existing organisation
 *
 * @param orgId
 * @param orgPayload
 * @returns updated organisation
 */
export async function updateOrg(
  orgId: Organisation['id'],
  orgPayload: OrganisationPayload
): Promise<Organisation> {
  const {
    name,
    description,
    isAdminOrg,
    inviteLink,
    isInactive,
    isInvisible,
    category,
  } = orgPayload
  const generatedSlug: string = getSlugFromIgName(orgPayload.name)
  const updatedOrg: Prisma.OrganisationCreateInput = {
    name,
    description,
    category,
    inviteLink,
    isAdminOrg,
    isInactive,
    isInvisible,
    slug: generatedSlug,
  }

  // Add excos
  const newUserOnOrgRecords = orgPayload.otherMembers.map((userId) => ({
    userId: userId,
    orgId: orgId,
    isIGHead: false,
  }))

  // Add IG head
  newUserOnOrgRecords.push({
    userId: orgPayload.igHead,
    orgId: orgId,
    isIGHead: true,
  })

  const isCreate = orgId === -1
  // For creating, we need the orgId first
  if (isCreate) {
    // Use an interactive transaction to ensure that database is consistent in event of error
    return prisma.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: updatedOrg,
      })

      const orgId = org.id
      const newUserOnOrgRecordsWithOrgId = newUserOnOrgRecords.map(
        (record) => ({
          ...record,
          orgId: orgId,
        })
      )
      await tx.userOnOrg.createMany({
        data: newUserOnOrgRecordsWithOrgId,
      })

      return org
    })
  }

  // Use a transaction to ensure that database is consistent in event of error
  const [org] = await prisma.$transaction([
    prisma.organisation.upsert({
      where: {
        id: orgId,
      },
      create: updatedOrg,
      update: updatedOrg,
    }),

    // Delete the existing userOnOrg
    prisma.userOnOrg.deleteMany({
      where: {
        orgId: orgId,
      },
    }),

    // Insert the new records
    prisma.userOnOrg.createMany({
      data: newUserOnOrgRecords,
    }),
  ])

  return org
}

/**
 * Deletes an existing {@link Organisation}
 * and all associated {@link UserOnOrg} and {@link Booking} records
 *
 * @param orgId the id of the organisation to delete
 * @returns the deleted organisation
 */
export async function deleteOrg(
  orgId: Organisation['id']
): Promise<Organisation> {
  const orgToDelete = await prisma.organisation.findFirst({
    where: {
      id: orgId,
    },
  })

  if (!orgToDelete) {
    throw new HttpException(
      `Could not find org with id ${orgId}`,
      HttpCode.BadRequest
    )
  }

  // due to onDelete: Cascade, any existing Bookings or UserOnOrgs will also get deleted
  return prisma.organisation.delete({
    where: {
      id: orgId,
    },
  })
}
