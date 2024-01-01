import { Response, Request, NextFunction } from 'express'
import { getAllVenues } from '@/services/venues'

/**
 * Retrieves all venues' details
 * @param req not used
 * @param res json with all venues' details
 * @param next
 */
export async function listVenue(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const venues = await getAllVenues()
    res.json(venues)
  } catch (error) {
    next(error)
  }
}
