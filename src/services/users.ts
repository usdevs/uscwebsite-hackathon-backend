import prisma from "./db";
import { Prisma, User } from "@prisma/client";
import { HttpCode, HttpException } from "@exceptions/HttpException";
import { throwIfNotAdmin } from "@/config/common";

/* Retrieves all users */
export async function getAllUsers(): Promise<Prisma.UserGetPayload<Prisma.UserArgs>[]> {
  return prisma.user.findMany();
}

type AdminUserId = {
  adminUserId: number
}

export type UserPayload = Pick<
  User,
  'name' | 'telegramUserName'
> & AdminUserId

/* Add a new user */
export async function addUser(userPayload: UserPayload): Promise<User> {
  await throwIfNotAdmin(userPayload.adminUserId);
  const userToAdd: Prisma.UserCreateInput = {...userPayload}
  return prisma.user.create({ data: userToAdd });
}

/**
 * Update an existing user
 *
 * @param userId
 * @param userPayload
 * @returns updated user
 */
export async function updateUser(
  userId: User['id'],
  userPayload: UserPayload,
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

  await throwIfNotAdmin(userPayload.adminUserId)

  const updatedUser: Prisma.UserUpdateInput = {...userPayload}

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: updatedUser,
  });
}

/* Delete an existing user */
export async function deleteUser(
  userToDeleteId: User['id'],
  adminUserId: User['id']
): Promise<User> {
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
      userId: userToDeleteId
    }
  })
  if (userOnOrg) {
    throw new HttpException(
      `User is a member of an existing organisation: ${userOnOrg.orgId}!`,
      HttpCode.BadRequest
    )
  }

  await throwIfNotAdmin(adminUserId)

  await prisma.booking.deleteMany({
    where: {
      bookedBy: {
        userId: userToDeleteId
      }
    }
  })

  return prisma.user.delete({
    where: {
      id: userToDeleteId,
    },
  });
}
