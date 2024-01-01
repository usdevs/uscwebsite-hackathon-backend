import { NextFunction, Request, Response } from 'express'
import { checkSignature, generateToken } from '@middlewares/auth.middleware'
import { HttpCode, HttpException } from '@/exceptions/HttpException'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../db'

import { TelegramAuthSchema } from '@interfaces/auth.interface'

export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userCredentials = TelegramAuthSchema.parse(req.body)

  if (!checkSignature(process.env.BOT_TOKEN || '', userCredentials)) {
    next(
      new HttpException(
        'Failed to check user credentials against those obtained from the bot!',
        HttpCode.Unauthorized
      )
    )
    return
  }

  let userId = 0
  const users = prisma.user
  const args: Prisma.UserFindManyArgs = {
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
  }
  const matchingUsersPromise: Promise<
    Prisma.UserGetPayload<Prisma.UserFindManyArgs>[]
  > = users.findMany(args)
  const matchingUsers: Prisma.UserGetPayload<Prisma.UserFindManyArgs>[] =
    await matchingUsersPromise
  if (matchingUsers.length === 0) {
    throw new HttpException('You are not authorized to access the NUSC website! Note: this may be an issue if you' +
      ' have recently changed your Telegram username without actually having logged into the NUSC website. If so,' +
      ' please add your new username via the Admin tab.', HttpCode.Unauthorized)
  } else if (matchingUsers.length > 1) {
    throw new HttpException(
      'Multiple database entries for the same telegramId or the same telegramUserName detected!' +
        ' Contact the website admin to ensure there is only one.',
      HttpCode.InternalServerError
    )
  } else {
    const user = matchingUsers[0]
    userId = user.id
    let name = `${userCredentials.first_name}`
    // because last name is optional on Tele
    if (userCredentials.last_name) {
      name = name + `${userCredentials.last_name}`
    }

    await users.update({
      where: { id: user.id },
      data: {
        name: name,
        telegramId: userCredentials.id,
        telegramUserName: userCredentials.username,
      },
    })
  }

  const userOrgs = await prisma.userOnOrg.findMany({
    where: {
      userId: userId,
    },
    include: {
      org: {
        select: {
          isAdminOrg: true
        }
      }
    }
  })

  const orgIds = userOrgs.map((userOrg) => userOrg.orgId)
  const isAdminUser: boolean = userOrgs.reduce((isAdmin, currentOrg) => {
    return isAdmin || currentOrg.org.isAdminOrg
  }, false)
  const token = generateToken(userCredentials)
  res.status(200).send({ userCredentials, token, orgIds, userId, isAdminUser })
}
