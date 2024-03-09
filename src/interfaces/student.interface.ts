import { z } from 'zod'

export const UpdateStudentSchema = z.object({
  name: z.string().min(1),
})

export const StudentSchema = UpdateStudentSchema.extend({
  matriculationNo: z.string().min(1).max(10),
})
