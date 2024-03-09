import { Booking } from '@prisma/client'
import { Response, Request } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { getAllBookings, getUserBookings } from '@services/bookings'
import * as Policy from '@/policy'

const listBookingsAction = 'list bookings'

/**
 * List all {@link Booking} within a given date range.
 *
 * A date range is valid if the start and end dates are valid ISO date strings.
 * The start date can be after the end date, in which case the response will be an empty array.
 */
export async function listBookings(req: Request, res: Response): Promise<void> {
  // Responsibility of frontend to return valid ISO datetime string
  const start = new Date(req.query.start as string)
  const end = new Date(req.query.end as string)
  if (isNaN(start.getTime())) {
    throw new HttpException(
      'Query start is not a valid date string',
      HttpCode.BadRequest
    )
  } else if (isNaN(end.getTime())) {
    throw new HttpException(
      'Query end is not a valid date string',
      HttpCode.BadRequest
    )
  }

  await Policy.Authorize(listBookingsAction, Policy.viewBookingPolicy())

  const bookings = await getAllBookings(start, end)
  res.json(bookings)
}

export async function getUserBookingsController(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.query.userId as string | undefined

  if (!userId) {
    throw new HttpException('Query missing userId', HttpCode.BadRequest)
  }

  await Policy.Authorize(listBookingsAction, Policy.viewBookingPolicy())

  const bookings = await getUserBookings(parseInt(userId))
  res.json(bookings)
}
