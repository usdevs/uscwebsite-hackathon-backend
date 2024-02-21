import { Response } from 'express'
import { RequestWithUser } from '@/interfaces/auth.interface'
import * as Policy from '@/policy'
import { HttpCode, HttpException } from '@/exceptions'
import { StudentSchema } from '@/interfaces/student.interface'
import { addStudent } from '@/services/students'

const createStudentAction = 'create student'

export async function createStudent(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const studentPayload = StudentSchema.parse(req.body)

  await Policy.Authorize(
    createStudentAction,
    Policy.createSubmissionPolicy(),
    req.user
  )

  const inserted = await addStudent(studentPayload)
  res.status(200).json({ result: [inserted] })
}
