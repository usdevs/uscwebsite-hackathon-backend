import { Response } from 'express'
import { RequestWithUser } from '@/interfaces/auth.interface'
import * as Policy from '@/policy'
import { SubmissionSchema } from '@/interfaces/submission.interface'
import { addSubmission } from '@/services/submissions'
import { HttpCode, HttpException } from '@/exceptions'
import { revalidateFolioFrontendSubmissions } from '@/services/frontend'

const createSubmissionAction = 'create submission'

export async function createSubmission(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const submissionPayloadRes = SubmissionSchema.safeParse(req.body)
  if (!submissionPayloadRes.success) {
    console.error('Invalid submission data', submissionPayloadRes.error.errors)
    throw new HttpException('Invalid submission data', HttpCode.BadRequest)
  }

  const submissionPayload = submissionPayloadRes.data
  await Policy.Authorize(
    createSubmissionAction,
    Policy.createSubmissionPolicy(),
    req.user
  )

  const inserted = await addSubmission(submissionPayload)
  await revalidateFolioFrontendSubmissions(inserted.id)

  res.status(200).json({ result: [inserted] })
}
