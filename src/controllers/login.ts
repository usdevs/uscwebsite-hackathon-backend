import { Response, Request } from 'express'
import { TelegramAuth } from 'src/Interfaces/auth'

export async function handleLogin(
  req: Request,
  res: Response
): Promise<void> {
  let credentials: TelegramAuth = req.body
  console.log(credentials)
  res.send('thanks for trying to login')
}