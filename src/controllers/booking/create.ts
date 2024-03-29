import { Response } from 'express'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { addBooking } from '@services/bookings'
import { BookingSchema } from '@/interfaces/booking.interface'
import * as Policy from '@/policy'

const createBookingAction = 'create booking'

export async function createBooking(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const booking = BookingSchema.parse(req.body)
  const bookingPayload = {
    end: booking.end,
    eventName: booking.eventName,
    start: booking.start,
    venueId: booking.venueId,
    userId: req.user?.id ?? -1,
    userOrgId: booking.orgId,
  }

  await Policy.Authorize(
    createBookingAction,
    Policy.createBookingPolicy(bookingPayload),
    req.user
  )

  const inserted = await addBooking(bookingPayload)
  res.status(200).json({ result: [inserted] })
}
