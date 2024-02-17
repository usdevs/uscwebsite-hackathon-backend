import { Response } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import * as Policy from '@/policy'
import { UpdateSubmissionSchema } from '@/interfaces/submission.interface'
import { updateSubmission } from '@/services/submissions'

const editSubmissionAction = 'edit submission'

export async function editSubmission(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const submissionToUpdateId = parseInt(req.params['id'], 10)
  if (Number.isNaN(submissionToUpdateId)) {
    throw new HttpException(
      'Submission id is not a number',
      HttpCode.BadRequest
    )
  }

  const submissionToUpdateRes = UpdateSubmissionSchema.safeParse(req.body)
  if (!submissionToUpdateRes.success) {
    throw new HttpException('Invalid submission data', HttpCode.BadRequest)
  }

  const submissionToUpdate = submissionToUpdateRes.data

  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(
    editSubmissionAction,
    Policy.updateSubmissionPolicy(),
    user
  )

  const updatedSubmission = await updateSubmission(
    submissionToUpdateId,
    submissionToUpdate
  )
  res.status(200).json({ result: [updatedSubmission] })
}
