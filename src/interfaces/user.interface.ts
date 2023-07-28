import { z } from 'zod'

export const UserSchema = z
  .object({
    name: z.string(),
    telegramUserName: z.string(),
    telegramId: z.string().nullish().transform(x => x ?? null)
  })
