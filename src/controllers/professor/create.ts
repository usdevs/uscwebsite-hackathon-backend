import { Response } from 'express'
import { RequestWithUser } from '@/interfaces/auth.interface'
import * as Policy from '@/policy'
import { HttpCode, HttpException } from '@/exceptions'
import { ProfessorSchema } from '@/interfaces/professor.interface'
import { addProfessor } from '@/services/professors'

const createProfessorAction = 'create professor'

export async function createProfessor(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const professorPayload = ProfessorSchema.parse(req.body)

  await Policy.Authorize(
    createProfessorAction,
    Policy.createSubmissionPolicy(),
    req.user
  )

  const inserted = await addProfessor(professorPayload)
  res.status(200).json({ result: [inserted] })
}
