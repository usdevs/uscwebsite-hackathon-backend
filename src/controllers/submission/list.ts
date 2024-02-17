import { Request, Response } from 'express'
import * as Policy from '@/policy'
import { getAllSubmissions } from '@/services/submissions'

const listSubmissionsAction = 'list submissions'

export async function listSubmissions(req: Request, res: Response) {
  await Policy.Authorize(listSubmissionsAction, Policy.viewSubmissionPolicy())
  const submissions = await getAllSubmissions()
  res.json(submissions)
}
