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
  const isUserAdmin = await checkIsUserAdmin(orgPayload.userId)
  let isOrgCoreAdminOrg = false

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
    oldSlug = orgToUpdate.slug
    isOrgCoreAdminOrg = isCoreAdminOrg(orgToUpdate.name)
  }

  const { name, description, isAdminOrg, inviteLink, isInactive, isInvisible, category } = orgPayload
  const generatedSlug: string = getSlugFromIgName(orgPayload.name)
  const updatedOrg: Prisma.OrganisationCreateInput = {name, description, category, inviteLink, isAdminOrg, isInactive, isInvisible, slug: generatedSlug}

  if (isAdminOrg && !isUserAdmin) {
    throw new HttpException(
      `You cannot make an organisation an admin organisation, if you are not an admin yourself.`,
      HttpCode.Forbidden
    )
  }

  if (isOrgCoreAdminOrg && (!isAdminOrg || !isCoreAdminOrg(name)))  {
    throw new HttpException(
      `You are attempting to either remove the admin permissions from a core admin org or change the name without including 'Management Committee' or 'Admin'.`,
      HttpCode.Forbidden
    )
  }

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
