import { Response } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { destroyBooking, getBookingById } from '@services/bookings'
import * as Policy from '@/policy'

const deleteBookingAction = 'delete booking'

export async function deleteBooking(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const bookingId = parseInt(req.params['id'], 10)
  if (Number.isNaN(bookingId)) {
    throw new HttpException('Invalid booking id', HttpCode.BadRequest)
  }
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const user = req.user
  const booking = await getBookingById(bookingId)

  await Policy.Authorize(
    deleteBookingAction,
    Policy.deleteBookingPolicy(booking, user),
    req.user
  )

  const deletedBooking = await destroyBooking(bookingId, req.user.id)
  res.status(200).json(deletedBooking)
}
