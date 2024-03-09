import { Semester } from '@prisma/client'
import { z } from 'zod'

export const UpdateSubmissionSchema = z.object({
  title: z.string().min(1).max(255),
  text: z.string().min(1),
})

export const SubmissionSchema = UpdateSubmissionSchema.extend({
  matriculationNo: z.string(),
  courseOfferingInput: z.object({
    courseCode: z.string(),
    professorId: z.number(),
    semester: z.nativeEnum(Semester),
    academicYear: z.number().refine((ay) => ay > 2016 && ay < 2030),
  }),
})
