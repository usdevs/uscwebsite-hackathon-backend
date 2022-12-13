import { Request } from 'express'
import { User } from '@prisma/client'

export interface RequestWithUser extends Request {
  user: User
}

export interface TelegramAuth {
  id: number
  first_name: string
  last_name: string
  username: string
  auth_date: string
  hash: string
}
