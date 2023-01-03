import { Request } from 'express'
import { User } from '@prisma/client'
import { z } from 'zod'

export interface RequestWithUser extends Request {
  user: User
}

export const TelegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  username: z.string(),
  auth_date: z.string(),
  hash: z.string(),
})

export type TelegramAuth = z.infer<typeof TelegramAuthSchema>

export const BookingSchema = z.object({
  venueId: z.number(),
  orgId: z.number(),
  userId: z.number(),
  start: z.string(),
  end: z.string(),
})
