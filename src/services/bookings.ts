import prisma from './db'
import { Booking } from '@prisma/client'

/* Retrieves all bookings */
export async function getAllBookings(): Promise<Booking[]> {
  return await prisma.booking.findMany()
}

/**
 * Retrieves all user bookings
 *
 * @param userId user id
 * @returns array of user bookings
 */
export async function getUserBookings(
  userId: Booking['userId']
): Promise<Booking[]> {
  return await prisma.booking.findMany({
    where: { userId: { equals: userId } },
  })
}

/**
 * Retrieves booking by id
 *
 * @param bookingId booking id
 * @returns booking
 */
export async function getBookingById(
  bookingId: Booking['id']
): Promise<Booking> {
  return await prisma.booking.findFirstOrThrow({
    where: { id: { equals: bookingId } },
  })
}

export type BookingPayload = Pick<
  Booking,
  'userId' | 'venueId' | 'orgId' | 'start' | 'end'
>

/* Add a new booking */
export async function addBooking(booking: BookingPayload): Promise<Booking> {
  return await prisma.booking.create({ data: booking })
}

/**
 * Update a existing a booking
 *
 * @param bookingId booking id
 * @param updatedBooking updated booking
 * @returns updated booking
 */
export async function updateBooking(
  bookingId: Booking['id'],
  updatedBooking: Booking
): Promise<Booking> {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: updatedBooking,
  })
}

/* Delete an existing booking */
export async function deleteBooking(
  bookingId: Booking['id']
): Promise<Booking> {
  return await prisma.booking.delete({
    where: {
      id: bookingId,
    },
  })
}
