import { Response } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import * as Policy from '@/policy'
import { UpdateStudentSchema } from '@/interfaces/student.interface'
import { updateStudent } from '@/services/students'

const editStudentAction = 'edit student'

export async function editStudent(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const studentId = req.params['matriculationNo']

  const studentToUpdateRes = UpdateStudentSchema.safeParse(req.body)
  if (!studentToUpdateRes.success) {
    throw new HttpException('Invalid student data', HttpCode.BadRequest)
  }

  const studentToUpdate = studentToUpdateRes.data

  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(
    editStudentAction,
    Policy.updateSubmissionPolicy(),
    user
  )

  const updatedStudent = await updateStudent(studentId, studentToUpdate)
  res.status(200).json({ result: [updatedStudent] })
}
