import { prisma } from '../../db'
import { Prisma, User } from '@prisma/client'
import { HttpCode, HttpException } from '@exceptions/HttpException'

/* Retrieves all users */
export async function getAllUsers(): Promise<
  Prisma.UserGetPayload<Prisma.UserArgs>[]
> {
  return prisma.user.findMany()
}

export type UserPayload = Pick<User, 'name' | 'telegramUserName' | 'telegramId'>

/* Add a new user */
export async function addUser(userPayload: UserPayload): Promise<User> {
  const userToAdd: Prisma.UserCreateInput = { ...userPayload }
  return prisma.user.create({ data: userToAdd })
}

/**
 * Update an existing user
 *
 * @param userId
 * @param userPayload
 * @param adminUserId
 * @returns updated user
 */
export async function updateUser(
  userId: User['id'],
  userPayload: UserPayload
): Promise<User> {
  const userToUpdate = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (!userToUpdate) {
    throw new HttpException(
      `Could not find user with id ${userId}`,
      HttpCode.BadRequest
    )
  }

  const updatedUser: Prisma.UserUpdateInput = { ...userPayload }
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: updatedUser,
  })
}

/* Delete an existing user */
export async function destroyUser(userToDeleteId: User['id']): Promise<User> {
  const userToDelete = await prisma.user.findFirst({
    where: {
      id: userToDeleteId,
    },
  })
  if (!userToDelete) {
    throw new HttpException(
      `Could not find user with id ${userToDeleteId}`,
      HttpCode.BadRequest
    )
  }

  // the reason for this check is that we would want the website users to deliberately remove users from the orgs
  // first, before deleting the user
  const userOnOrg = await prisma.userOnOrg.findFirst({
    where: {
      userId: userToDeleteId,
    },
    select: {
      org: {
        select: {
          name: true,
        },
      },
    },
  })
  if (userOnOrg) {
    throw new HttpException(
      `User is a member of an existing organisation: ${userOnOrg.org.name}!`,
      HttpCode.BadRequest
    )
  }

  return prisma.user.delete({
    where: {
      id: userToDeleteId,
    },
  })
}

/**
 * Returns the abilities of a user.
 * Remark: Conventionally roles should belong to the user, but given the requirements of the project,
 * we have to perform many joins.
 */
export async function getUserAbilities(userId: number) {
  const userAbilities = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      userOrg: {
        select: {
          org: {
            select: {
              orgRoles: {
                select: {
                  role: {
                    select: {
                      roleAbilities: {
                        select: {
                          ability: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!userAbilities) return []

  // Flatten the result to get a simple list of abilities
  const abilities = userAbilities.userOrg.flatMap((userOnOrg) =>
    userOnOrg.org.orgRoles.flatMap((orgRole) =>
      orgRole.role.roleAbilities.map((roleAbility) => roleAbility.ability)
    )
  )

  return abilities
}

export const getUserRoles = async (userId: number) => {
  const userRoles = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      userOrg: {
        select: {
          org: {
            select: {
              orgRoles: {
                select: {
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!userRoles) return []

  const roles = userRoles.userOrg.flatMap((userOnOrg) =>
    userOnOrg.org.orgRoles.map((orgRole) => orgRole.role)
  )

  return roles
}

export const getUserOrgs = async (userId: number) => {
  const userOrgs = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      userOrg: {
        select: {
          org: true,
        },
      },
    },
  })

  if (!userOrgs) return []

  const orgs = userOrgs.userOrg.map((userOnOrg) => userOnOrg.org)

  return orgs
}
