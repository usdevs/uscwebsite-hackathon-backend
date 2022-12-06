import { Response, Request } from 'express'
import { TelegramAuth } from 'src/Interfaces/auth'
import { createHash, createHmac } from 'crypto'
import { BOT_TOKEN } from '../configs/common'

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const userCredentials: TelegramAuth = req.body
  const secretKey = createHash('sha256').update(BOT_TOKEN).digest('hex')

  const dataCheckString = Object.keys(userCredentials)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${userCredentials[key as keyof TelegramAuth]}`)
    .join('\n')

  const hmac = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  console.log(hmac)
  console.log(userCredentials['hash'])

  res.send('thanks for trying to login')
}
