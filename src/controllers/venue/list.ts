import { Response, Request, NextFunction } from 'express'
import { getAllVenues } from '@/services/venues'

import * as Policy from '@/policy'

const listVenueAction = 'list venue'

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
    await Policy.Authorize(listVenueAction, Policy.listVenuePolicy())

    const venues = await getAllVenues()
    res.json(venues)
  } catch (error) {
    next(error)
  }
}
