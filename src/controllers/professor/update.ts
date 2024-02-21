import { Response } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import * as Policy from '@/policy'
import { UpdateProfessorSchema } from '@/interfaces/professor.interface'
import { updateProfessor } from '@/services/professors'

const editProfessorAction = 'edit professor'

export async function editProfessor(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const professorId = parseInt(req.params['id'], 10)
  if (Number.isNaN(professorId)) {
    throw new HttpException('Professor id is not a number', HttpCode.BadRequest)
  }

  const professorToUpdateRes = UpdateProfessorSchema.safeParse(req.body)
  if (!professorToUpdateRes.success) {
    throw new HttpException('Invalid professor data', HttpCode.BadRequest)
  }

  const professorToUpdate = professorToUpdateRes.data

  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(
    editProfessorAction,
    Policy.updateSubmissionPolicy(),
    user
  )

  const updatedProfessor = await updateProfessor(professorId, professorToUpdate)
  res.status(200).json({ result: [updatedProfessor] })
}
