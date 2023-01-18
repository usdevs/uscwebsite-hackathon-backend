import prisma from './db'
import { Booking } from '@prisma/client'
import { HttpCode, HttpException } from '@/exceptions/HttpException'
import {
  DURATION_PER_SLOT,
  MIN_SLOTS_PER_BOOKING,
  MAX_SLOTS_PER_BOOKING,
  MIN_SLOTS_BETWEEN_BOOKINGS,
} from '@/config/common'
import { checkConflictingBooking, checkedStackedBookings, checkIsUserAdmin } from '@middlewares/checks'

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
  const venue = await prisma.venue.findFirst({ where: { id: booking.venueId } })
  if (!venue) {
    throw new HttpException(
      `Could not find venue with id ${booking.venueId}`,
      HttpCode.BadRequest
    )
  }
  const userOnOrg = await prisma.userOnOrg.findFirst({
    where: { userId: booking.userId, orgId: booking.orgId },
  })
  if (!userOnOrg) {
    throw new HttpException(
      `You are not a member of this organisation`,
      HttpCode.BadRequest
    )
  }

  if (await checkConflictingBooking(booking)) {
    throw new HttpException(
      `There is already another booking within the same timeslot`,
      HttpCode.BadRequest
    )
  }

  if (await checkIsUserAdmin(booking.userId)) {
    return await prisma.booking.create({ data: booking })
  }

  if (
    booking.end.getTime() - booking.start.getTime() >
    DURATION_PER_SLOT * MAX_SLOTS_PER_BOOKING * 1000 * 60
  ) {
    throw new HttpException(
      `Booking duration is too long, please change your booking request.`,
      HttpCode.BadRequest
    )
  }

  if (
    booking.start.getTime() - booking.start.getTime() <
    DURATION_PER_SLOT * MIN_SLOTS_PER_BOOKING * 1000 * 60
  ) {
    throw new HttpException(
      `Booking duration is too short, please change your booking request.`,
      HttpCode.BadRequest
    )
  }

  if (await checkedStackedBookings(booking)) {
    throw new HttpException(
      `Please leave a duration of at least ${DURATION_PER_SLOT * MIN_SLOTS_BETWEEN_BOOKINGS
      } minutes in between consecutive bookings`,
      HttpCode.BadRequest
    )
  }

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
