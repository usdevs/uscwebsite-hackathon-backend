import { User, Organisation, Prisma } from '@prisma/client'
import { BookingPayload } from '@services/bookings'
import {
  DURATION_PER_SLOT,
  MAX_SLOTS_PER_BOOKING,
  MIN_SLOTS_BETWEEN_BOOKINGS,
  MIN_SLOTS_PER_BOOKING,
} from '@/config/common'
import { prisma } from '../../db'
import { BookingAdminRole, WebsiteAdminRole } from '@/policy'

/**
 * Returns true if user is in the organisation
 * @param userId user id
 * @param orgId organisation id
 * @returns true if user is in the organisation
 */
export async function checkIsUserInOrg(
  userId: number,
  orgId: number
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      userOrg: {
        some: {
          orgId: orgId,
        },
      },
    },
  })

  return !!user
}

/*Returns number of minutes*/
function convertDateToMinutes(date: Date): number {
  return date.getTime() / (1000 * 60)
}

/**
 * Checks that the user has selected at least the minimum number of slots
 * and that the interval selected is in multiples of the slot size
 * and that the end time is a multiple of the slot size
 *
 * @param start
 * @param end
 * @returns true if  there is no violation
 */
export function checkStartEndTime(start: Date, end: Date): boolean {
  return (
    (convertDateToMinutes(end) - convertDateToMinutes(start)) /
      DURATION_PER_SLOT >=
      MIN_SLOTS_PER_BOOKING &&
    (convertDateToMinutes(end) - convertDateToMinutes(start)) %
      DURATION_PER_SLOT ==
      0 &&
    convertDateToMinutes(end) % DURATION_PER_SLOT == 0 &&
    // check if current date is at most 14 days before start date
    convertDateToMinutes(start) - convertDateToMinutes(new Date()) <=
      14 * 24 * 60
  )
}

/**
 * Checks if the user is an admin
 *
 * @param userId
 * @returns true if user is an admin
 */
export async function checkIsUserAdmin(userId: number): Promise<boolean> {
  // TODO: remove this first check when we fully migrate to the new policy module
  const result = await prisma.userOnOrg.findFirst({
    where: {
      AND: [
        {
          userId: userId,
        },
        {
          org: {
            isAdminOrg: true,
          },
        },
      ],
    },
  })
  if (result !== null) {
    return true
  }

  const result2 = await prisma.userOnOrg.findFirst({
    where: {
      AND: [
        {
          userId: userId,
        },
        {
          org: {
            orgRoles: {
              some: {
                roleId: WebsiteAdminRole.id,
              },
            },
          },
        },
      ],
    },
  })

  return result2 !== null
}

export async function checkIsUserBookingAdmin(userId: number) {
  const res = await prisma.userOnOrg.findFirst({
    where: {
      AND: [
        {
          userId: userId,
        },
        {
          org: {
            orgRoles: {
              some: {
                roleId: { in: [WebsiteAdminRole.id, BookingAdminRole.id] },
              },
            },
          },
        },
      ],
    },
  })

  return res !== null
}

/**
 * Checks if the duration of the booking is within the booking privilege of the organisation
 *
 * @param booking
 * @returns true if booking is legal
 */
export async function checkBookingPrivelege(booking: BookingPayload) {
  const { start, end, userId } = booking
  const isUserAdmin = await checkIsUserAdmin(userId)

  if (isUserAdmin) {
    // admins can make bookings of any length
    return true
  } else {
    // check that that the booking does not exceeds the user's privilege
    const numberOfSlots =
      (convertDateToMinutes(end) - convertDateToMinutes(start)) /
      DURATION_PER_SLOT
    return numberOfSlots <= MAX_SLOTS_PER_BOOKING
  }
}

/**
 * Checks that there exists conflicting booking in the database
 *
 * @param booking
 * @param exclude
 * @returns true if there is overlap
 */
export async function checkConflictingBooking(
  booking: BookingPayload,
  exclude?: number
): Promise<boolean> {
  const startTime = booking.start
  const endTime = booking.end
  const conflicting = await prisma.booking.findFirst({
    where: {
      AND: [
        {
          start: {
            lt: endTime,
          },
        },
        {
          deleted: {
            not: true,
          },
        },
      ],
      id: typeof exclude !== undefined ? { not: exclude } : {},
      venueId: booking.venueId,
    },
    orderBy: {
      end: Prisma.SortOrder['desc'],
    },
  })

  return conflicting !== null && conflicting.end > startTime
}

/**
 * Checks that there are no bookings by the same organisation on the same venue that violates
 * the stacking rule (admin bookings are exempted)
 * Stacking rule: the interval between the end of the latest earlier booking and the start of this booking must be greater than the gap
 *
 * @param booking
 * @returns true if no violation of stacking rule is found
 */
export async function checkStackedBookings(booking: BookingPayload) {
  const { userOrgId, start, end, venueId } = booking
  const isAdminOrg = await prisma.userOnOrg.findMany({
    where: {
      AND: [
        {
          orgId: userOrgId,
        },
        {
          org: {
            isAdminOrg: true,
          },
        },
      ],
    },
  })

  if (isAdminOrg.length > 0) {
    return true
  }

  const latestEarlierBooking = await prisma.booking.findFirst({
    orderBy: [
      {
        end: Prisma.SortOrder['desc'],
      },
    ],
    where: {
      AND: [
        {
          end: { lte: start },
        },
        {
          deleted: {
            not: true,
          },
        },
      ],
      venueId,
      userOrgId,
    },
  })

  const earliestLaterBooking = await prisma.booking.findFirst({
    orderBy: [
      {
        start: Prisma.SortOrder['asc'],
      },
    ],
    where: {
      AND: [
        {
          start: { gte: end },
        },
        {
          deleted: {
            not: true,
          },
        },
      ],
      venueId,
      userOrgId,
    },
  })

  // interval between the end of the latest earlier booking and the start of this booking must be greater than the gap
  const hasEarlierStackedBooking = latestEarlierBooking
    ? (convertDateToMinutes(start) -
        convertDateToMinutes(latestEarlierBooking.end)) /
        DURATION_PER_SLOT >=
      MIN_SLOTS_BETWEEN_BOOKINGS
    : true
  // interval between start of the earliest later booking and the end of this booking must be greater than the gap
  const hasLaterStackedBooking = earliestLaterBooking
    ? (convertDateToMinutes(earliestLaterBooking.start) -
        convertDateToMinutes(end)) /
        DURATION_PER_SLOT >=
      MIN_SLOTS_BETWEEN_BOOKINGS
    : true

  return hasEarlierStackedBooking && hasLaterStackedBooking
}
