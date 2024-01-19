import { createHash, createHmac } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { RequestWithUser, TelegramAuth } from '@interfaces/auth.interface'
import { default as jwt } from 'jsonwebtoken'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { prisma } from '../../db'
import { User } from '@prisma/client'

const SECRET_KEY = process.env.SECRET_KEY || 'hello'

// Checks signature according to the telegram login widget api
export function checkSignature(
  token: string,
  userCredentials: TelegramAuth
): boolean {
  const secretKey = createHash('sha256').update(token).digest()
  const dataCheckString = Object.keys(userCredentials)
    .filter(
      (key) => key !== 'hash' && userCredentials[key as keyof TelegramAuth]
    )
    .sort()
    .map((key) => `${key}=${userCredentials[key as keyof TelegramAuth]}`)
    .join('\n')

  const hmac = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  return userCredentials['hash'] === hmac
}

export function generateToken(payload: TelegramAuth): string {
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: '1h',
  })
}

export async function requiresAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.header('Authorization')
    const token = (authHeader && authHeader.split(' ')[1]) || ''

    const decoded = jwt.verify(token, SECRET_KEY) as TelegramAuth

    const users = prisma.user
    let findUser: User | null
    findUser = await users.findUnique({
      where: { telegramId: decoded.id },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`Dev: Find with telegramUsername: ${decoded.username}`)
      findUser = await users.findFirst({
        where: { telegramUserName: decoded.username },
      })
    }

    if (!findUser) {
      next(
        new HttpException(
          "Could not find user's telegramId in database, is the telegramId registered?",
          HttpCode.Unauthorized
        )
      )
      return
    }
    ;(req as RequestWithUser).user = findUser
    next()
  } catch (err: unknown) {
    let httpResponse = 'Wrong credentials'
    if (err instanceof Error) httpResponse = err.name + ' ' + err.message
    next(new HttpException(httpResponse, HttpCode.Unauthorized))
  }
}
