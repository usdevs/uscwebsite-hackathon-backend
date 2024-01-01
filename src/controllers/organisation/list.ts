import { Response, Request, NextFunction } from 'express'
import { getAllOrgs } from '@/services/organisations'

/**
 * Retrieves all organisation details
 * @param req not used
 * @param res json with all organisation details
 * @param next
 */
export async function listOrgs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orgs = await getAllOrgs()
    res.json(orgs)
  } catch (error) {
    next(error)
  }
}
