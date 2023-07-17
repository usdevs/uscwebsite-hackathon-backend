import { z } from 'zod'
import { IGCategory } from "@prisma/client";

export const OrganisationSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    verified: z.boolean(),
    inviteLink: z.string(),
    category: z.nativeEnum(IGCategory),
    isInactive: z.boolean(),
    isInvisible: z.boolean(),
  })
