import { Request, Response } from 'express'
import * as Policy from '@/policy'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { HttpCode, HttpException } from '@/exceptions'
import { deleteProfessor } from '@/services/professors'

const deleteProfessorAction = 'delete professor'

export async function handleDeleteProfessor(
  req: RequestWithUser,
  res: Response
) {
  const professorId = parseInt(req.params['id'], 10)
  if (Number.isNaN(professorId)) {
    throw new HttpException('Professor id is not a number', HttpCode.BadRequest)
  }

  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(
    deleteProfessorAction,
    Policy.deleteSubmissionPolicy(),
    req.user
  )

  const professor = await deleteProfessor(professorId)
  res.status(200).json(professor)
}
