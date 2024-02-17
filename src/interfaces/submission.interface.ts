import { z } from 'zod'

export const SubmissionSchema = z.object({
  title: z.string().min(1).max(255),
  text: z.string().min(1),
  matriculationNo: z.string(),
  courseOfferingId: z.number(),
})
