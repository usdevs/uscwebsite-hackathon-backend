import { Response } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import * as Policy from '@/policy'
import { UpdateCourseSchema } from '@/interfaces/course.interface'
import { updateCourse } from '@/services/courses'

const editCourseAction = 'edit course'

export async function editCourse(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const courseCode = req.params['code']
  const courseToUpdateRes = UpdateCourseSchema.safeParse(req.body)
  if (!courseToUpdateRes.success) {
    throw new HttpException('Invalid course data', HttpCode.BadRequest)
  }

  const courseToUpdate = courseToUpdateRes.data

  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(
    editCourseAction,
    Policy.updateSubmissionPolicy(),
    user
  )

  const updatedCourse = await updateCourse(courseCode, courseToUpdate)
  res.status(200).json({ result: [updatedCourse] })
}
