import { Response } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { addBooking } from '@services/bookings'
import { BookingSchema } from '@/interfaces/booking.interface'
import * as Policy from '@/policy'

const createBookingAction = 'create booking'

export async function createBooking(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const booking = BookingSchema.parse(req.body)
  const bookingPayload = {
    end: booking.end,
    eventName: booking.eventName,
    start: booking.start,
    venueId: booking.venueId,
    userId: user.id,
    userOrgId: booking.orgId,
  }

  await Policy.Authorize(
    createBookingAction,
    Policy.createBookingPolicy(bookingPayload),
    user
  )

  const inserted = await addBooking(bookingPayload)
  res.status(200).json({ result: [inserted] })
}
