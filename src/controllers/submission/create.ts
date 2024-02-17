import { Response } from 'express'
import { RequestWithUser } from '@/interfaces/auth.interface'
import * as Policy from '@/policy'
import { SubmissionSchema } from '@/interfaces/submission.interface'
import { addSubmission } from '@/services/submissions'
import { HttpCode, HttpException } from '@/exceptions'

const createSubmissionAction = 'create submission'

export async function createSubmission(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const submissionPayload = SubmissionSchema.parse(req.body)

  await Policy.Authorize(
    createSubmissionAction,
    Policy.createSubmissionPolicy(),
    req.user
  )

  const inserted = await addSubmission(submissionPayload)
  res.status(200).json({ result: [inserted] })
}
