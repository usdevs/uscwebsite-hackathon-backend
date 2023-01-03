import { Response, Request, NextFunction } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { Booking } from '@prisma/client'
import { addBooking } from '@services/bookings'
import { BookingSchema } from '@/interfaces/booking.interface'
import { RequestWithUser } from '@/interfaces/auth.interface'

export async function createBooking(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = req.user
  const booking = BookingSchema.parse(req.body)
  const bookingPayload = { ...booking, userId: user.id }
  const inserted = await addBooking(bookingPayload)
  res.status(200).json({ result: [inserted] })
}

export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  next(new HttpException('hello', HttpCode.NotFound))
}

export async function editBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.send('edit booking!')
}

export async function deleteBooking(
  req: Request,
  res: Response
): Promise<void> {
  res.send('delete booking!')
}
