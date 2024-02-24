import { Request, Response } from 'express'
import * as Policy from '@/policy'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { HttpCode, HttpException } from '@/exceptions'
import { deleteSubmission } from '@/services/submissions'
import { revalidateFolioFrontendSubmissions } from '@/services/frontend'

const deleteSubmissionAction = 'delete submission'

export async function handleDeleteSubmission(
  req: RequestWithUser,
  res: Response
) {
  const submissionId = parseInt(req.params['id'], 10)
  if (Number.isNaN(submissionId)) {
    throw new HttpException('Invalid submission id', HttpCode.BadRequest)
  }

  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(
    deleteSubmissionAction,
    Policy.deleteSubmissionPolicy(),
    req.user
  )

  const submission = await deleteSubmission(submissionId)
  await revalidateFolioFrontendSubmissions(submissionId)
  res.status(200).json(submission)
}
