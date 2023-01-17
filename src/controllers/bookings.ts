import { Response, Request, NextFunction } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { Booking } from '@prisma/client'
import { addBooking, updateBooking } from '@services/bookings'
import { BookingSchema } from '@/interfaces/booking.interface'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { getUserBookings } from '@services/bookings'

export async function createBooking(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = req.user
  const booking = BookingSchema.parse(req.body)
  const bookingPayload = { ...booking, userId: user!.id }
  const inserted = await addBooking(bookingPayload)
  res.status(200).json({ result: [inserted] })
}

export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.query.userId as string | undefined

    if (!userId) {
      throw new HttpException('Query missing userId', HttpCode.BadRequest)
    }

    const bookings = getUserBookings(parseInt(userId))
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

export async function deleteBooking(
  req: Request,
  res: Response
): Promise<void> {
  res.send('delete booking!')
}
