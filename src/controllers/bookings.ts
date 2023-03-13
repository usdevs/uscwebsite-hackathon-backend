import { Response, Request, NextFunction } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { addBooking, getAllBookings, getUserBookings, deleteBooking, updateBooking } from '@services/bookings'
import { BookingSchema } from '@/interfaces/booking.interface'

export async function createBooking(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }
  const booking = BookingSchema.parse(req.body)
  const bookingPayload = { ...booking, userId: user!.id }
  const inserted = await addBooking(bookingPayload)
  res.status(200).json({ result: [inserted] })
}

export async function getAllBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Responsibility of frontend to return valid ISO datetime string
  try {
    const start = new Date(req.query.start as string)
    const end = new Date(req.query.end as string)
    if (isNaN(start.getTime())) {
      throw new HttpException('Query start is not a valid date string', HttpCode.BadRequest)
    } else if (isNaN(end.getTime())) {
      throw new HttpException('Query end is not a valid date string', HttpCode.BadRequest)
    }
    const bookings = getAllBookings(start, end)
    res.json(bookings)
  } catch (error) {
    next(error)
  }
}

export async function getUserBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.query.userId as string | undefined

    if (!userId) {
      throw new HttpException('Query missing userId', HttpCode.BadRequest)
    }

    const bookings = await getUserBookings(parseInt(userId))
    res.json(bookings)
  } catch (error) {
    next(error)
  }
}


export async function editBooking(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {

  const bookingId = parseInt(req.params['id'], 10)
  if (Number.isNaN(bookingId)) {
    throw new HttpException('Booking id not found', HttpCode.BadRequest)
  }
  const userId = req.user!.id
  const booking = BookingSchema.parse(req.body)
  const bookingPayload = { ...booking, userId: userId }
  const updatedBooking = await updateBooking(bookingId, bookingPayload, userId)
  res.status(200).json({ result: [updatedBooking] })
}

export async function deleteBookingHandler(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const bookingId = parseInt(req.params['id'], 10)
  if (Number.isNaN(bookingId)) {
    throw new HttpException('Booking id not found', HttpCode.BadRequest)
  }
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }
  const booking = await deleteBooking(bookingId, req.user.id)
  res.json(booking)
}
