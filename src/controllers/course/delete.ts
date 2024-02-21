import { Request, Response } from 'express'
import * as Policy from '@/policy'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { HttpCode, HttpException } from '@/exceptions'
import { deleteCourse } from '@/services/courses'

const deleteCourseAction = 'delete course'

export async function handleDeleteCourse(req: RequestWithUser, res: Response) {
  const courseCode = req.params['code']

  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(
    deleteCourseAction,
    Policy.deleteSubmissionPolicy(),
    req.user
  )

  const course = await deleteCourse(courseCode)
  res.status(200).json(course)
}
