import { Response, Request, NextFunction } from 'express'
import { checkSignature, generateToken } from '@middlewares/auth.middleware'
import { TelegramAuth } from '@interfaces/auth.interface'
import { HttpCode, HttpException } from '@/exceptions/HttpException'
import { PrismaClient, Prisma } from '@prisma/client'

import { TelegramAuthSchema } from '@interfaces/auth.interface'

export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userCredentials = TelegramAuthSchema.parse(req.body)

  if (!checkSignature(process.env.BOT_TOKEN || '', userCredentials)) {
    next(new HttpException('Wrong credentials!', HttpCode.Unauthorized))
    return
  }

  // TODO: update database tables
  let userId = 0
  const users = new PrismaClient().user
  try {
    const matchingUsers = await users.findMany({
      where: {
        OR: [
          {
            telegramId: userCredentials.id,
          },
          {
            telegramId: null,
            telegramUserName: userCredentials.username,
          },
        ],
      },
      orderBy: {
        telegramId: { sort: 'asc', nulls: 'last' },
      },
    })
    if (matchingUsers.length === 0) {
      throw new HttpException('Not authorized!', HttpCode.Unauthorized)
    } else {
      // Delete all matching entries except for the first one
      matchingUsers.forEach(async (user, index) => {
        if (index !== 0) {
          await users.delete({ where: { id: user.id } })
        } else {
          userId = user.id

          await users.update({
            where: { id: user.id },
            data: {
              name: `${userCredentials.first_name} ${userCredentials.last_name}`,
              telegramId: userCredentials.id,
              telegramUserName: userCredentials.username,
            },
          })
        }
      })
    }
  } catch (error) {
    next(error)
    return
  }

  const userOrgs = await new PrismaClient().userOnOrg.findMany({
    where: {
      userId: userId,
    },
  })

  const orgIds = userOrgs.map((userOrg) => userOrg.orgId)
  const token = generateToken(userCredentials)
  res.status(200).send({ userCredentials, token, orgIds })
}
