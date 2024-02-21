import { Request, Response } from 'express'
import * as Policy from '@/policy'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { HttpCode, HttpException } from '@/exceptions'
import { deleteStudent } from '@/services/students'

const deleteStudentAction = 'delete student'

export async function handleDeleteStudent(req: RequestWithUser, res: Response) {
  const studentId = req.params['matriculationNo']

  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(
    deleteStudentAction,
    Policy.deleteSubmissionPolicy(),
    req.user
  )

  const student = await deleteStudent(studentId)
  res.status(200).json(student)
}
