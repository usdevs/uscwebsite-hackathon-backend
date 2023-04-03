import prisma from './db'
import { User } from '@prisma/client'

/* Get user info based on userID    */
export async function getUserInfo(userID: number): Promise<User> {
  return await prisma.user.findFirstOrThrow({
    where: {
      id: userID,
    },
  })
}
