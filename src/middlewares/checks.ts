import { User, Organisation, Booking } from '@prisma/client'
import {
  ADMIN_ID,
  DURATION_PER_SLOT,
  MAX_SLOTS_PER_BOOKING,
  MIN_SLOTS_BETWEEN_BOOKINGS,
  MIN_SLOTS_PER_BOOKING,
} from 'src/configs/common'
import prisma from 'src/services/db'

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
              orgId: ADMIN_ID,
            },
          ],
        },
      ],
    },
  })
  return result.length > 0
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
    (end.getMinutes() - start.getMinutes()) / DURATION_PER_SLOT >=
      MIN_SLOTS_PER_BOOKING &&
    (end.getMinutes() - start.getMinutes()) % DURATION_PER_SLOT == 0
  )
}

/**
 * Checks if the duration of the booking is within the booking privilege of the organisation
 *
 * @param start
 * @param end
 * @param user
 * @returns true if duration exceeds privilege
 */
export async function checkBookingPrivelege(
  start: Date,
  end: Date,
  user: User
) {
  const userOnAdmin = await prisma.userOnOrg.findMany({
    where: {
      AND: [
        {
          user: user,
        },
        {
          orgId: ADMIN_ID,
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
      (end.getMinutes() - start.getMinutes()) / DURATION_PER_SLOT
    return numberOfSlots <= MAX_SLOTS_PER_BOOKING
  }
}

/**
 * Checks that there does NOT exist conflicting booking in the database
 *
 * @param start
 * @param end
 * @returns true if there is no overlap
 */
export async function checkConflictingBooking(
  start: Date,
  end: Date
): Promise<boolean> {
  function isOverlapping(start_A: Date, end_A: Date): boolean {
    const s = start_A.getMinutes() > start.getMinutes() ? start_A : start
    const e = end_A.getMinutes() < end.getMinutes() ? end_A : end
    return s <= e
  }

  // get all bookings that end after the start time
  const timeBookings: Array<Booking> = await prisma.booking.findMany({
    where: {
      end: { gt: start },
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

//  No stacking booking within bookings of the same org
export async function checkStackedBookings(
  org: Organisation,
  start: Date,
  end: Date
) {
  const latestEarlierBooking = await prisma.booking.findFirst({
    orderBy: [
      {
        end: 'desc',
      },
    ],
    where: {
      end: { lt: start },
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
    },
  })

  // interval between the end of the latest earlier booking and the start of this booking must be greater than the gap
  const hasEarlierStackedBooking = latestEarlierBooking
    ? (start.getMinutes() - latestEarlierBooking.end.getMinutes()) /
        MIN_SLOTS_PER_BOOKING <
      MIN_SLOTS_BETWEEN_BOOKINGS
    : false
  // interval between start of the earliest later booking and the end of this booking must be greater than the gap
  const hasLaterStackedBooking = earliestLaterBooking
    ? (earliestLaterBooking.start.getMinutes() - end.getMinutes()) /
        MIN_SLOTS_PER_BOOKING <
      MIN_SLOTS_BETWEEN_BOOKINGS
    : false

  return !(hasEarlierStackedBooking && hasLaterStackedBooking)
}
