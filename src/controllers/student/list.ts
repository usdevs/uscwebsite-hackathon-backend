import { Request, Response } from 'express'
import * as Policy from '@/policy'
import { getAllStudents } from '@/services/students'

const listStudentsAction = 'list students'

export async function listStudents(req: Request, res: Response) {
  await Policy.Authorize(listStudentsAction, Policy.viewSubmissionPolicy())
  const students = await getAllStudents()
  res.json(students)
}
