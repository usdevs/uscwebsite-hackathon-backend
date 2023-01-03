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
  const users = new PrismaClient().user
  try {
    const updatedUsers = await users.updateMany({
      where: {
        OR: [
          {
            telegramId: String(userCredentials.id),
          },
          {
            telegramId: null,
            telegramUserName: userCredentials.username,
          },
        ],
      },
      data: {
        name: `${userCredentials.first_name} ${userCredentials.last_name}`,
        telegramId: String(userCredentials.id),
        telegramUserName: userCredentials.username,
      },
    })

    if (updatedUsers.count === 0) {
      throw new HttpException('Not authorized!', HttpCode.Unauthorized)
    }
  } catch (error) {
    next(error)
    return
  }

  const token = generateToken(userCredentials)

  res.status(200).send(token)
}
