import { User, Organisation, Booking, Venue } from '@prisma/client'
import { BookingPayload } from '../services/bookings'
import {
  DURATION_PER_SLOT,
  MAX_SLOTS_PER_BOOKING,
  MIN_SLOTS_BETWEEN_BOOKINGS,
  MIN_SLOTS_PER_BOOKING,
} from '../configs/common'
import prisma from '../services/db'

/**
 * Checks if user is in the organisation OR if the user is an Admin
 *
 * @param user
 * @param organisation
 * @returns true if user is in the organisation
 */
export async function checkUserinOrg(
  user: User,
  organisation: Organisation
): Promise<boolean> {
  // find all userOnOrg where user is in the organisation OR user is an admin
  const result = await prisma.userOnOrg.findMany({
    where: {
      OR: [
        {
          AND: [
            {
              user: user,
            },
            {
              org: organisation,
            },
          ],
        },
        {
          AND: [
            {
              user: user,
            },
            {
              org: {
                verified: true,
              },
            },
          ],
        },
      ],
    },
  })
  return result.length > 0
}

/*Returns number of minutes*/
function convertDateToMinutes(date: Date): number {
  return date.getTime() / (1000 * 60)
}

/**
 * Checks that the user has selected at least the minimum number of slots
 * and that the interval selected is in multiples of the slot size
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
      0
  )
}

/**
 * Checks if the duration of the booking is within the booking privilege of the organisation
 *
 * @param booking
 * @returns true if duration exceeds privilege
 */
export async function checkBookingPrivelege(booking: BookingPayload) {
  const { start, end, userId } = booking
  const userOnAdmin = await prisma.userOnOrg.findMany({
    where: {
      AND: [
        {
          userId: userId,
        },
        {
          org: {
            verified: true,
          },
        },
      ],
    },
  })

  if (userOnAdmin.length > 0) {
    // admins can make bookings of any length
    return true
  } else {
    // check that that the booking exceeds the user's privilege
    const numberOfSlots =
      (convertDateToMinutes(end) - convertDateToMinutes(start)) /
      DURATION_PER_SLOT
    return numberOfSlots <= MAX_SLOTS_PER_BOOKING
  }
}

/**
 * Checks that there does NOT exist conflicting booking in the database
 *
 * @param booking
 * @returns true if there is no overlap
 */
export async function checkConflictingBooking(
  booking: BookingPayload
): Promise<boolean> {
  const { start, end, venueId } = booking

  function isOverlapping(start_A: Date, end_A: Date): boolean {
    const s =
      convertDateToMinutes(start_A) > convertDateToMinutes(start)
        ? start_A
        : start
    const e =
      convertDateToMinutes(end_A) < convertDateToMinutes(end) ? end_A : end
    return s <= e
  }

  // get all bookings that end after the start time
  const timeBookings: Array<Booking> = await prisma.booking.findMany({
    where: {
      end: { gt: start },
      venueId: venueId,
    },
  })

  // check every potential booking for overlap
  for (var i = 0; i < timeBookings.length; i++) {
    if (isOverlapping(timeBookings[i].start, timeBookings[i].end)) {
      return false
    }
  }
  return true
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
  const { orgId, start, end, venueId } = booking
  const isAdminOrg = await prisma.userOnOrg.findMany({
    where: {
      AND: [
        {
          orgId: orgId,
        },
        {
          org: {
            verified: true,
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
        end: 'desc',
      },
    ],
    where: {
      end: { lt: start },
      venueId: venueId,
      orgId: orgId,
    },
  })

  const earliestLaterBooking = await prisma.booking.findFirst({
    orderBy: [
      {
        start: 'asc',
      },
    ],
    where: {
      start: { gt: end },
      venueId: venueId,
      orgId: orgId,
    },
  })

  // interval between the end of the latest earlier booking and the start of this booking must be greater than the gap
  const hasEarlierStackedBooking = latestEarlierBooking
    ? (convertDateToMinutes(start) -
        convertDateToMinutes(latestEarlierBooking.end)) /
        DURATION_PER_SLOT <=
      MIN_SLOTS_BETWEEN_BOOKINGS
    : true
  // interval between start of the earliest later booking and the end of this booking must be greater than the gap
  const hasLaterStackedBooking = earliestLaterBooking
    ? (convertDateToMinutes(earliestLaterBooking.start) -
        convertDateToMinutes(end)) /
        DURATION_PER_SLOT <=
      MIN_SLOTS_BETWEEN_BOOKINGS
    : true

  return hasEarlierStackedBooking && hasLaterStackedBooking
}
