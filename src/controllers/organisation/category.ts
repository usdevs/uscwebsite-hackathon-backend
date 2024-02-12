import { Response, Request, NextFunction } from 'express'
import { getAllOrgCategories } from '@/services/organisations'

export async function listOrgCategories(
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
