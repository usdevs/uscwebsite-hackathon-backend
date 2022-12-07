import { Response, Request } from 'express'
import {
  TelegramAuth,
  checkSignature,
  generateToken,
} from '../middlewares/auth'
import { default as jwt } from 'jsonwebtoken'

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const userCredentials: TelegramAuth = req.body
  if (!checkSignature(process.env.BOT_TOKEN || '', userCredentials)) {
    res.status(401).send('Wrong credentials!')
  }

  // TODO: update database tables

  const token = generateToken(userCredentials)

  res.status(200).send(token)
}
