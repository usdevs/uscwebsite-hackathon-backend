import { Response, Request, NextFunction } from 'express'
import { getAllOrgs } from '@/services/organisations'
import * as Policy from '@/policy'

const listOrgsAction = 'list organisations'

/**
 * Retrieves all organisation details
 *
 * @param res json with all organisation details
 */
export async function listOrgs(_req: Request, res: Response): Promise<void> {
  await Policy.Authorize(listOrgsAction, Policy.listOrgsPolicy())

  const orgs = await getAllOrgs()
  res.json(orgs)
}
