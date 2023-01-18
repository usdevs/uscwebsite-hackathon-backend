import { Request, Response } from 'express'
import { User } from '@prisma/client'
import { z } from 'zod'

export interface RequestWithUser extends Request {
  user?: User
}

export const TelegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  photo_url: z.string().optional(),
  username: z.string(),
  auth_date: z.number(),
  hash: z.string(),
})

export type TelegramAuth = z.infer<typeof TelegramAuthSchema>
