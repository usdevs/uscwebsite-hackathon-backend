import { Request } from 'express'
import { User } from '@prisma/client'
import { AllowedSchema } from 'express-json-validator-middleware'

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

export const telegramAuthSchema: AllowedSchema = {
  type: 'object',
  required: ['id', 'first_name', 'last_name', 'username', 'auth_date', 'hash'],
  properties: {
    id: {
      type: 'number',
    },
    first_name: {
      type: 'string',
    },
    last_name: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
    auth_date: {
      type: 'string',
    },
    hash: {
      type: 'string',
    },
  },
}
