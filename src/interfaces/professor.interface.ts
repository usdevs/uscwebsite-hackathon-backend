import { z } from 'zod'

export const UpdateProfessorSchema = z.object({
  name: z.string().min(1),
})

export const ProfessorSchema = UpdateProfessorSchema
