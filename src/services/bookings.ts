import { prisma } from '../../db'
import { Booking, Prisma } from '@prisma/client'
import { HttpCode, HttpException } from '../exceptions/HttpException'
import {
  checkConflictingBooking,
  checkIsUserBookingAdmin,
  checkIsUserInOrg,
} from '../middlewares/checks'
import { BookingAdminRole, WebsiteAdminRole } from '@/policy'

/* Retrieves all bookings */
export async function getAllBookings(
  start: Date,
  end: Date
): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: {
      AND: [
        {
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
        {
          deleted: {
            not: true,
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
    where: {
      AND: [
        {
          userId: userId,
        },
        {
          deleted: {
            not: true,
          },
        },
      ],
    },
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
    where: {
      AND: [
        { id: { equals: bookingId } },
        { deleted: { not: true } }
      ]
    },
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

/** Helper function to retrieve the first organisation where the user has a
 * Booking Admin / Website Admin role.
 */
async function getFirstBookingAdminOrgForUser(userId: number) {
  const adminUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      userOrg: {
        include: {
          org: {
            select: {
              id: true,
              name: true,
              orgRoles: true,
            },
          },
        },
      },
    },
  })
  const adminUserOrgs = adminUser.userOrg.map((x) => x.org)
  const adminOrg = adminUserOrgs.find((org) =>
    org.orgRoles.some(
      (orgRole) =>
        orgRole.roleId === BookingAdminRole.id ||
        orgRole.roleId === WebsiteAdminRole.id
    )
  )

  return adminOrg
}

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

  const isAdminBookingOnBehalfOfAnotherOrg =
    !(await checkIsUserInOrg(booking.userId, booking.userOrgId)) &&
    (await checkIsUserBookingAdmin(booking.userId))

  // admin users can also make bookings on behalf of other organisations
  if (isAdminBookingOnBehalfOfAnotherOrg) {
    console.log(
      `Admin user ${booking.userId} is booking for another org - ${booking.userOrgId}`
    )
    const adminOrg = await getFirstBookingAdminOrgForUser(booking.userId)
    if (!adminOrg) {
      throw new Error('Should not reach - checkIsUserBookingAdmin is broken')
    }

    // userOrgId is the org that the admin user belongs to, bookedForOrgId is the org the booking was made for
    const bookingToCreate = {
      ...booking,
      userOrgId: adminOrg.id,
      bookedForOrgId: booking.userOrgId,
    }
    try {
      const booking = await prisma.booking.create({ data: bookingToCreate })
      console.log(`Booking created in DB with ID: ${booking.id}`)
      return booking
    } catch (error : any) {
      console.log(`Prisma booking insertion failed: ${error.message}`, {
        payload: bookingToCreate,
        prismaError: error,
      })
      throw error
    }
  }

  const bookingToCreate = { ...booking }
  try {
    const booking = await prisma.booking.create({ data: bookingToCreate })
    console.log(`Booking created in DB with ID: ${booking.id}`)
    return booking
  } catch (error : any) {
    console.log(`Prisma booking insertion failed: ${error.message}`, {
      payload: bookingToCreate,
      prismaError: error,
    })
    throw error
  }
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
  const bookingToUpdate = await prisma.booking.findFirst({
    where: {
      AND: [
        { id: { equals: bookingId } },
        { deleted: { not: true } }
      ]
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
      AND: [
        { id: { equals: bookingId } },
        { deleted: { not: true } }
      ]
    },
  })
  if (!bookingToDelete) {
    throw new HttpException(
      `Could not find booking with id ${bookingId}`,
      HttpCode.BadRequest
    )
  }

  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      deleted: true,
    },
  })
}
