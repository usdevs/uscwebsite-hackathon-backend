import { Response, Request, NextFunction } from 'express'
import { getAllOrgCategories, getAllOrgs } from "@/services/organisations";

/**
 * Retrieves all organisation details
 * @param req not used
 * @param res json with all organisation details
 * @param next
 */
export async function getOrgs(
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

export async function getOrgCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orgs = await getAllOrgCategories()
    res.json(orgs)
  } catch (error) {
    next(error)
  }
}

