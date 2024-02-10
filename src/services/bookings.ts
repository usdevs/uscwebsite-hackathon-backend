import { prisma } from '../../db'
import { Booking, Prisma } from '@prisma/client'
import { HttpCode, HttpException } from '../exceptions/HttpException'
import {
  checkConflictingBooking,
  checkIsUserBookingAdmin,
} from '../middlewares/checks'
import { BookingAdminRole, WebsiteAdminRole } from '@/policy'

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
    orderBy: { start: Prisma.SortOrder['asc'] },
    include: {
      venue: true,
      bookedBy: {
        //todo optimise fetching of this data
        include: {
          org: true,
          user: true,
        },
      },
      bookedForOrg: true,
    },
  })
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
  return prisma.booking.findFirstOrThrow({
    where: { id: { equals: bookingId } },
    include: {
      venue: true,
      bookedBy: true,
    },
  })
}

export type BookingPayload = Pick<
  Booking,
  'eventName' | 'userId' | 'venueId' | 'start' | 'end' | 'userOrgId'
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

  // admin users can also make bookings on behalf of other organisations
  if (await checkIsUserBookingAdmin(booking.userId)) {
    const adminUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: booking.userId,
      },
      include: {
        userOrg: {
          include: {
            org: {
              select: {
                id: true,
                name: true,
                isAdminOrg: true,
                orgRoles: true,
              },
            },
          },
        },
      },
    })
    const adminUserOrgs = adminUser.userOrg.map((x) => x.org)
    const adminUserOrgRoles = adminUserOrgs.flatMap((x) => x.orgRoles)
    const indexOfBookingOrgId = adminUserOrgs.findIndex(
      (org) => org.id === booking.userOrgId
    )
    if (indexOfBookingOrgId === -1) {
      const adminOrg =
        adminUserOrgs.find((org) => org.isAdminOrg) ||
        adminUserOrgRoles.find(
          (orgRole) =>
            orgRole.roleId === BookingAdminRole.id ||
            orgRole.roleId === WebsiteAdminRole.id
        )
      if (!adminOrg) {
        throw new HttpException(
          `No admin org found for you`,
          HttpCode.BadRequest
        )
      }
      // userOrgId is the org that the admin user belongs to, bookedForOrgId is the org the booking was made for
      const bookingToCreate = {
        ...booking,
        userOrgId: adminOrg.id,
        bookedForOrgId: booking.userOrgId,
      }
      return prisma.booking.create({ data: bookingToCreate })
    }

    const bookingToCreate = { ...booking, userOrgId: booking.userOrgId }
    return prisma.booking.create({ data: bookingToCreate })
  }

  const bookingToCreate = { ...booking }
  return prisma.booking.create({ data: bookingToCreate })
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
  updatedBooking: BookingPayload
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
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: updatedBooking,
  })
}

/* Delete an existing booking */
export async function destroyBooking(
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

  return prisma.booking.delete({
    where: {
      id: bookingId,
    },
  })
}
