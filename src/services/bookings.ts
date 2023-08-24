import { prisma } from '../../db'
import { Booking } from '@prisma/client'
import { HttpCode, HttpException } from '@/exceptions/HttpException'
import {
  DURATION_PER_SLOT,
  MIN_SLOTS_PER_BOOKING,
  MAX_SLOTS_PER_BOOKING,
  MIN_SLOTS_BETWEEN_BOOKINGS,
} from '@/config/common'
import {
  checkConflictingBooking,
  checkStackedBookings,
  checkIsUserAdmin,
} from '@middlewares/checks'

/* Retrieves all bookings */
export async function getAllBookings(
  start: Date,
  end: Date
): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: {
      OR: [
        {
          start: {
            gte: start,
            lte: end,
          },
          end: {
            gte: start,
            lte: end,
          },
        },
      ],
    },
    orderBy: { start: 'asc' },
    include: {
      venue: true,
      bookedBy: {
        //todo optimise fetching of this data
        include: {
          org: true,
          user: true
        }
      },
    },
  });
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
  return prisma.booking.findMany({
    where: { userId: userId },
  });
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
  return prisma.booking.findFirstOrThrow({
    where: { id: { equals: bookingId } },
    include: {
      venue: true,
      bookedBy: true,
    },
  });
}

export type BookingPayload = Pick<
  Booking,
  'eventName' | 'userId' | 'venueId' | 'orgId' | 'start' | 'end'
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

  if (await checkConflictingBooking(booking)) {
    throw new HttpException(
      `There is already another booking within the same timeslot`,
      HttpCode.BadRequest
    )
  }

  if (await checkIsUserAdmin(booking.userId)) {
    return prisma.booking.create({ data: booking });
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
    booking.end.getTime() - booking.start.getTime() <
    DURATION_PER_SLOT * MIN_SLOTS_PER_BOOKING * 1000 * 60
  ) {
    throw new HttpException(
      `Booking duration is too short, please change your booking request.`,
      HttpCode.BadRequest
    )
  }

  if (
    booking.start.getTime() - new Date().getTime() >
    14 * 24 * 60 * 60 * 1000
  ) {
    throw new HttpException(
      `You can only book up to 14 days in advance`,
      HttpCode.BadRequest
    )
  }

  if (!(await checkStackedBookings(booking))) {
    throw new HttpException(
      `Please leave a duration of at least ${
        DURATION_PER_SLOT * MIN_SLOTS_BETWEEN_BOOKINGS
      } minutes in between consecutive bookings`,
      HttpCode.BadRequest
    )
  }

  return prisma.booking.create({ data: booking });
}

/**
 * Update a existing a booking
 *
 * @param bookingId booking id
 * @param updatedBooking updated booking
 * @param userId
 * @returns updated booking
 */
export async function updateBooking(
  bookingId: Booking['id'],
  updatedBooking: BookingPayload,
  userId: Booking['userId']
): Promise<Booking> {
  const bookingToUpdate = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  })

  if (!bookingToUpdate) {
    throw new HttpException(
      `Could not find booking with id ${bookingId}`,
      HttpCode.BadRequest
    )
  }

  if (await checkConflictingBooking(updatedBooking, bookingId)) {
    throw new HttpException(
      `There is already another booking within the same timeslot`,
      HttpCode.BadRequest
    )
  }

  if (await checkIsUserAdmin(userId)) {
    return prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: updatedBooking,
    });
  }

  if (bookingToUpdate.userId !== userId) {
    throw new HttpException(
      `You do not have permission to edit this booking`,
      HttpCode.Forbidden
    )
  }

  const userOnOrg = await prisma.userOnOrg.findFirst({
    where: { userId: userId, orgId: updatedBooking.orgId },
  })
  if (!userOnOrg) {
    throw new HttpException(
      `You are not a member of this organisation`,
      HttpCode.BadRequest
    )
  }

  if (
    updatedBooking.end.getTime() - updatedBooking.start.getTime() >
    DURATION_PER_SLOT * MAX_SLOTS_PER_BOOKING * 1000 * 60
  ) {
    throw new HttpException(
      `Booking duration is too long, please change your booking request.`,
      HttpCode.BadRequest
    )
  }

  if (
    updatedBooking.start.getTime() - updatedBooking.start.getTime() <
    DURATION_PER_SLOT * MIN_SLOTS_PER_BOOKING * 1000 * 60
  ) {
    throw new HttpException(
      `Booking duration is too short, please change your booking request.`,
      HttpCode.BadRequest
    )
  }

  if (
    updatedBooking.start.getTime() - new Date().getTime() >
    14 * 24 * 60 * 60 * 1000
  ) {
    throw new HttpException(
      `You can only book up to 14 days in advance`,
      HttpCode.BadRequest
    )
  }

  if (!(await checkStackedBookings(updatedBooking))) {
    throw new HttpException(
      `Please leave a duration of at least ${
        DURATION_PER_SLOT * MIN_SLOTS_BETWEEN_BOOKINGS
      } minutes in between consecutive bookings`,
      HttpCode.BadRequest
    )
  }

  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: updatedBooking,
  });
}

/* Delete an existing booking */
export async function deleteBooking(
  bookingId: Booking['id'],
  userId: Booking['userId']
): Promise<Booking> {
  const bookingToDelete = await prisma.booking.findFirst({
    where: {
      id: bookingId,
    },
  })
  if (!bookingToDelete) {
    throw new HttpException(
      `Could not find booking with id ${bookingId}`,
      HttpCode.BadRequest
    )
  }

  if (bookingToDelete.userId !== userId && !(await checkIsUserAdmin(userId))) {
    throw new HttpException(
      `You do not have permission to delete this booking`,
      HttpCode.Forbidden
    )
  }
  return prisma.booking.delete({
    where: {
      id: bookingId,
    },
  });
}
