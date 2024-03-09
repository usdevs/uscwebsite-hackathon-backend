import { Request, Response } from 'express'
import * as Policy from '@/policy'
import { getAllCourses } from '@/services/courses'

const listCoursesAction = 'list courses'

export async function listCourses(req: Request, res: Response) {
  await Policy.Authorize(listCoursesAction, Policy.viewSubmissionPolicy())
  const courses = await getAllCourses()
  res.json(courses)
}
