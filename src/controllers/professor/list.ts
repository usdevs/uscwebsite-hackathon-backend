import { Request, Response } from 'express'
import * as Policy from '@/policy'
import { getAllProfessors } from '@/services/professors'

const listProfessorsAction = 'list professors'

export async function listProfessors(req: Request, res: Response) {
  await Policy.Authorize(listProfessorsAction, Policy.viewSubmissionPolicy())
  const professors = await getAllProfessors()
  res.json(professors)
}
