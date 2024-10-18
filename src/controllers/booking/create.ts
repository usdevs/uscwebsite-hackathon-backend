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
  const booking = BookingSchema.parse(req.body)
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }
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

  let inserted
  
  try {
    inserted = await addBooking(bookingPayload)
    console.log(`Booking ${inserted.id} inserted successfully`)
  } catch (error : any) {
    console.log(`Booking failed: ${error.message}`)
    throw new HttpException('Failed to create booking', HttpCode.InternalServerError)
  }

  res.status(200).json({ result: [inserted] })
}
