import { Response, Request, NextFunction } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { Booking } from '@prisma/client'
import { addBooking } from '@services/bookings'

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const booking = JSON.parse(req.body) as Booking
    const inserted = await addBooking(booking)
    res.status(200).json({ result: [inserted] })
  } catch (err) {
    next(err)
  }
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
