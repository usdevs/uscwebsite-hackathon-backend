import { z } from 'zod'

export const UpdateSubmissionSchema = z.object({
  title: z.string().min(1).max(255),
  text: z.string().min(1),
})

export const SubmissionSchema = UpdateSubmissionSchema.extend({
  matriculationNo: z.string(),
  courseOfferingId: z.number(),
})
