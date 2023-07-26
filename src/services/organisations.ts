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
  if (orgId === -1) {
    await throwIfNotAdmin(orgPayload.userId)
  }
  else {
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
    if (!await checkIsUserAdmin(orgPayload.userId))  {
      const userOnOrg = await prisma.userOnOrg.findFirst({
        where: { userId: orgPayload.userId, orgId: orgId },
      })
      if (!userOnOrg) {
        throw new HttpException(
          `You are neither a member of this organisation.`,
          HttpCode.Forbidden
        )
      }
    }
    oldSlug = orgToUpdate.slug
  }

  const { name, description, isAdminOrg, inviteLink, isInactive, isInvisible, category } = orgPayload
  const generatedSlug: string = getSlugFromIgName(orgPayload.name)
  const updatedOrg: Prisma.OrganisationCreateInput = {name, description, category, inviteLink, isAdminOrg, isInactive, isInvisible, slug: generatedSlug}

  const org: Organisation = await prisma.organisation.upsert({
    where: {
      slug: oldSlug,
    },
    create: updatedOrg,
    update: updatedOrg,
  });
  if (orgId !== -1) {
    // deleting removed useronorg
    await prisma.userOnOrg.deleteMany({
      where: {
        NOT: {
          userId: { in: [...orgPayload.otherMembers, orgPayload.igHead] }
        },
        orgId
      }
    })
  }
  // todo there is the case where we promote an existing member to be the IG Head - then in this case, we must
  //  update the isIGHead field only instead of creating a new UserOnOrg --> then if existing IG head is demoted,
  //  also check for his existence and then demote him
  // todo we also have onUpdate: Cascade
  // add IG head first
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
  // add the others
  for (const orgMember of orgPayload.otherMembers) {
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

  await throwIfNotAdmin(userId)

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

  // if someone wants to delete the entire organisation, we can assume they do not care about existing Bookings or
  // UserOnOrgs
  // todo change to use onDelete: Cascade
  await prisma.booking.deleteMany({
    where: {
      bookedBy: {
        orgId: orgId
      }
    }
  })

  await prisma.userOnOrg.deleteMany({
    where: {
      orgId: orgId
    }
  })

  return prisma.organisation.delete({
    where: {
      id: orgId,
    },
  });
}
