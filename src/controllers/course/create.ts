import { Response } from 'express'
import { RequestWithUser } from '@/interfaces/auth.interface'
import * as Policy from '@/policy'
import { CourseSchema } from '@/interfaces/course.interface'
import { addCourse } from '@/services/courses'
import { HttpCode, HttpException } from '@/exceptions'

const createCourseAction = 'create course'

export async function createCourse(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const coursePayload = CourseSchema.parse(req.body)

  await Policy.Authorize(
    createCourseAction,
    Policy.createSubmissionPolicy(),
    req.user
  )

  const inserted = await addCourse(coursePayload)
  res.status(200).json({ result: [inserted] })
}
