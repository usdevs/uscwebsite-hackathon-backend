import prisma from './db'
import { Prisma, User } from "@prisma/client";

/* Get user info based on userID    */
export async function getUserInfo(userID: number): Promise<User> {
  return prisma.user.findFirstOrThrow({
    where: {
      id: userID,
    },
  });
}

/* Retrieves all users */
export async function getAllUsers(): Promise<Prisma.UserGetPayload<Prisma.UserArgs>[]> {
  return prisma.user.findMany();
}
