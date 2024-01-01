import { Response, Request } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { getAllBookings, getUserBookings } from '@services/bookings'

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

  const bookings = await getUserBookings(parseInt(userId))
  res.json(bookings)
}
