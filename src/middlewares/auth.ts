import { createHash, createHmac } from 'crypto'
import { Response, Request, NextFunction } from 'express'
import { default as jwt } from 'jsonwebtoken'

const SECRET_KEY = process.env.SECRET_KEY || 'hello'

export interface TelegramAuth {
  id: string
  first_name: string
  last_name: string
  username: string
  auth_date: string
  hash: string
}

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

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header('Authentication') || ''

    console.log(token)
    const decoded = jwt.verify(token, SECRET_KEY)
    console.log(decoded)
    next()
  } catch (err) {
    res.status(401).send('Wrong credentials!')
  }
}
