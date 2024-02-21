import { z } from 'zod'

export const UpdateCourseSchema = z.object({
  name: z.string().min(1),
})

export const CourseSchema = UpdateCourseSchema.extend({
  code: z.string().min(1).max(12),
})
