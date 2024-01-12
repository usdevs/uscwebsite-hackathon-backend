import { Response } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { updateBooking } from '@services/bookings'
import { BookingSchema } from '@/interfaces/booking.interface'
import * as Policy from '@/policy'

const updateBookingAction = 'update booking'

export async function editBooking(
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
  const userId = req.user.id
  const booking = BookingSchema.parse(req.body)
  const bookingPayload = {
    end: booking.end,
    eventName: booking.eventName,
    start: booking.start,
    venueId: booking.venueId,
    userId,
    userOrgId: booking.orgId,
  }

  await Policy.Authorize(
    updateBookingAction,
    Policy.updateBookingPolicy(bookingPayload, req.user),
    req.user
  )

  const updatedBooking = await updateBooking(bookingId, bookingPayload, userId)
  res.status(200).json({ result: [updatedBooking] })
}
