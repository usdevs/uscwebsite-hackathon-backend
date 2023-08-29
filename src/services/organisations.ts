import { prisma } from '../../db'
import { IGCategory, Organisation, Prisma, UserOnOrg } from "@prisma/client";
import { HttpCode, HttpException } from "@exceptions/HttpException";
import { checkIsUserAdmin } from "@middlewares/checks";
import { throwIfNotAdmin, getSlugFromIgName } from "@/config/common";

type OrganisationsWithIGHeads = Prisma.OrganisationGetPayload<{
  include: {
    userOrg: {
      include: {
        user: true
      }
    }
  };
}>;

const isCoreAdminOrg = (name: string) => {
  return name.includes("Management Committee") || name.includes("Admin") || name.includes("MC")
}

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

type OrgMembers = {
  igHead: number
  otherMembers: number[]
}

export type OrganisationPayload = Pick<
  Organisation,
  'name' | 'description' | 'isAdminOrg' | 'inviteLink' | 'category' | 'isInvisible' | 'isInactive'
> & UserId & OrgMembers

/**
 * Upsert an existing organisation
 *
 * @param orgId
 * @param orgPayload
 * @returns updated organisation
 */
export async function updateOrg(
  orgId: Organisation['id'],
  orgPayload: OrganisationPayload,
): Promise<Organisation> {
  let oldSlug: string = ''; // no org would have an empty slug, so it's fine to use this in order to signify that
  // the org does not exist and that it should be created
  // Idea of using slug as unique identifier taken from:
  // https://stackoverflow.com/questions/55404678/how-to-upsert-new-record-in-prisma-without-an-id
  const isUserAdmin = await checkIsUserAdmin(orgPayload.userId)
  const isNewOrg = orgId === -1

  const { name, description, isAdminOrg, inviteLink, isInactive, isInvisible, category } = orgPayload
  const generatedSlug: string = getSlugFromIgName(orgPayload.name)
  const updatedOrg: Prisma.OrganisationCreateInput = {name, description, category, inviteLink, isAdminOrg, isInactive, isInvisible, slug: generatedSlug}

  let isIgHeadChanged = false;
  let isOldIgHeadStillInExco = false;
  let oldIgHeadId: number = -1;

  if (isAdminOrg && !isUserAdmin) {
    throw new HttpException(
      `You cannot make an organisation an admin organisation, if you are not an admin yourself.`,
      HttpCode.Forbidden
    )
  }

  // check if the request to create or edit an org is valid
  if (isNewOrg) {
    await throwIfNotAdmin(orgPayload.userId)
  }
  else {
    const orgToUpdate: Organisation = await prisma.organisation.findUniqueOrThrow({
      where: {
        id: orgId,
      }
    })
    const existingIgHead: UserOnOrg = await prisma.userOnOrg.findFirstOrThrow({
      where: {
        orgId: orgToUpdate.id,
        isIGHead: true
      }
    })
    oldIgHeadId = existingIgHead.userId
    if (!orgToUpdate) {
      throw new HttpException(
        `Could not find org with id ${orgId}`,
        HttpCode.BadRequest
      )
    }
    if (!isUserAdmin)  {
      const userOnOrg = await prisma.userOnOrg.findFirst({
        where: { userId: orgPayload.userId, orgId: orgId },
      })
      if (!userOnOrg) {
        throw new HttpException(
          `You are neither a member of this organisation nor an admin.`,
          HttpCode.Forbidden
        )
      }
    }
    const isOrgCoreAdminOrg = isCoreAdminOrg(orgToUpdate.name)

    if (isOrgCoreAdminOrg && (!isAdminOrg || !isCoreAdminOrg(name)))  {
      throw new HttpException(
        `You are attempting to either remove the admin permissions from a core admin org or change the name without including 'Management Committee' or 'Admin'.`,
        HttpCode.Forbidden
      )
    }

    oldSlug = orgToUpdate.slug
    isIgHeadChanged = oldIgHeadId !== orgPayload.igHead
    isOldIgHeadStillInExco = orgPayload.otherMembers.includes(oldIgHeadId)
  }

  const org: Organisation = await prisma.organisation.upsert({
    where: {
      slug: oldSlug,
    },
    create: updatedOrg,
    update: updatedOrg,
  });

  // perform cleanup operations for a request to edit an org
  if (!isNewOrg) {
    // this will delete UserOnOrg who are no longer the IG head or members of the ExCo
    await prisma.userOnOrg.deleteMany({
      where: {
        NOT: {
          userId: { in: [...orgPayload.otherMembers, orgPayload.igHead] }
        },
        orgId
      }
    })
    // handle the case if an org was edited and the IG Head was demoted to just be an ExCo member
    if (isIgHeadChanged && isOldIgHeadStillInExco) {
      const demotedIgHead = {
        userId: oldIgHeadId,
        orgId: org.id
      }
      const igHeadCompoundType: Prisma.UserOnOrgWhereUniqueInput = {
        userId_orgId: demotedIgHead
      }
      await prisma.userOnOrg.update({
        where: igHeadCompoundType,
        data: { ...demotedIgHead, isIGHead: false },
      })
    }
  }
  // add IG head using upsert - this handles the case where you are both editing an existing org or creating a new org
  // this also handles the case where the IG head is not changed
  const igHead = {
    userId: orgPayload.igHead,
    orgId: org.id
  }
  const igHeadCompoundType: Prisma.UserOnOrgWhereUniqueInput = {
    userId_orgId: igHead
  }
  await prisma.userOnOrg.upsert({
    where: igHeadCompoundType,
    create: {...igHead, isIGHead: true},
    update: {...igHead, isIGHead: true}
  })
  // filter the new igHead from the otherMembers, as a precaution
  const otherExcoMembers = orgPayload.otherMembers.filter(otherMember => otherMember !== orgPayload.igHead)
  // add the other new ExCo members
  for (const orgMember of otherExcoMembers) {
    const member = {
      userId: orgMember,
      orgId: org.id
    }
    const igHeadCompoundType: Prisma.UserOnOrgWhereUniqueInput = {
      userId_orgId: member
    }
    await prisma.userOnOrg.upsert({
      where: igHeadCompoundType,
      create: {...member, isIGHead: false},
      update: {...member, isIGHead: false}
    })
  }
  return org
}

/* Delete an existing org */
export async function deleteOrg(
  orgId: Organisation['id'],
  userId: UserOnOrg['userId']
): Promise<Organisation> {
  const orgToDelete: Organisation = await prisma.organisation.findFirstOrThrow({
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

  await throwIfNotAdmin(userId)

  if (isCoreAdminOrg(orgToDelete.name)) {
    throw new HttpException(
      `Users cannot directly delete this admin organisation because it is a core admin organisation.`,
      HttpCode.Forbidden
    )
  }

  const userOnOrg = await prisma.userOnOrg.findFirst({
    where: {
      userId,
      orgId: orgId
    },
  })

  if (!userOnOrg) {
    throw new HttpException(
      `You are not a member of this organisation.`,
      HttpCode.Forbidden
    )
  }

  // due to onDelete: Cascade, any existing Bookings or UserOnOrgs will also get deleted
  return prisma.organisation.delete({
    where: {
      id: orgId,
    },
  });
}
