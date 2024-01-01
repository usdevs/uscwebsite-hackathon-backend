import { Response } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { destroyBooking } from '@services/bookings'

export async function deleteBooking(
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
  const booking = await destroyBooking(bookingId, req.user.id)
  res.json(booking)
}
