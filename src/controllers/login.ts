import { Response, Request } from 'express'
import { TelegramAuth } from 'src/Interfaces/auth'
import { createHash, createHmac } from 'crypto'

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const userCredentials: TelegramAuth = req.body
  if (!checkSignature(process.env.BOT_TOKEN || '', userCredentials)) {
    res.status(401) // unauthorised
    res.send('Wrong credentials!')
  }

  res.send('thanks for trying to login')
}

// Checks signature according to the telegram login widget api
function checkSignature(token: string, userCredentials: TelegramAuth) : boolean {
  const secretKey = createHash('sha256').update(token).digest()
  const dataCheckString = Object.keys(userCredentials)
    .filter((key) => key !== 'hash' && userCredentials[key as keyof TelegramAuth])
    .sort()
    .map((key) => `${key}=${userCredentials[key as keyof TelegramAuth]}`)
    .join('\n')

  const hmac = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  return userCredentials['hash'] === hmac
}