import { User, Organisation, UserOnOrg, Venue, Booking } from '@prisma/client'
import { DURATION_PER_SLOT, MIN_SLOTS_BETWEEN_BOOKINGS } from '../config/common'
import { BookingPayload } from '../services/bookings'
import { prismaMock } from '../services/test/singleton'

import {
  generateRandomAdminOrganisation,
  generateRandomOrganisation,
  generateRandomUser,
  generateRandomVenue,
  generateUserOnOrg,
} from '../services/test/utils'

import {
  checkIsUserInOrg,
  checkStartEndTime,
  checkBookingPrivelege,
  checkConflictingBooking,
  checkStackedBookings,
} from './checks'

const admin: User = generateRandomUser()
const user: User = generateRandomUser()
const normalOrg: Organisation = generateRandomOrganisation()
const adminOrg: Organisation = generateRandomAdminOrganisation()
const normalUserOnOrg: UserOnOrg = generateUserOnOrg(user, normalOrg)
const adminUserOnOrg: UserOnOrg = generateUserOnOrg(admin, adminOrg)
const venue: Venue = generateRandomVenue()

beforeEach(() => {
  jest.resetAllMocks()
})

describe('check user is in organisation', () => {
  test('check succeeds', async () => {
    prismaMock.user.findFirst.mockResolvedValue(user)
    await expect(checkIsUserInOrg(user.id, normalOrg.id)).resolves.toEqual(true)
  })

  test('check succeeds for admin', async () => {
    prismaMock.user.findFirst.mockResolvedValue(admin)
    await expect(checkIsUserInOrg(admin.id, normalOrg.id)).resolves.toEqual(
      true
    )
  })

  test('check fails', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    await expect(checkIsUserInOrg(user.id, adminOrg.id)).resolves.toEqual(false)
  })
})

describe('check start and end time', () => {
  test('check succeeds for 30 min booking', () => {
    expect(
      checkStartEndTime(
        new Date(2021, 1, 2, 22, 30),
        new Date(2021, 1, 2, 23, 0)
      )
    ).toEqual(true)
  })

  test('check fails, end < start', () => {
    expect(checkStartEndTime(new Date(), new Date(2020, 1, 1))).toEqual(false)
  })

  test('check fails, duration less than min duration', () => {
    expect(
      checkStartEndTime(
        new Date(2021, 1, 2, 22, 35),
        new Date(2021, 1, 2, 23, 0)
      )
    ).toEqual(false)
  })

  test('check fails, duration is not a multiple of slot size', () => {
    expect(
      checkStartEndTime(
        new Date(2021, 1, 2, 22, 30),
        new Date(2021, 1, 2, 23, 1)
      )
    ).toEqual(false)
  })

  test('check fails, end or start is not a multiple of slot size', () => {
    expect(
      checkStartEndTime(
        new Date(2021, 1, 2, 22, 31),
        new Date(2021, 1, 2, 23, 1)
      )
    ).toEqual(false)
  })
})

// Note: cannot mock the checkIsUserAdmin function for some reason, so
// we'll just mock the prisma call.
describe('check booking privilege', () => {
  test('check succeeds, normal user', async () => {
    const booking: BookingPayload = {
      eventName: 'test event',
      start: new Date(2021, 1, 2, 22, 30),
      end: new Date(2021, 1, 2, 23, 0),
      userId: user.id,
      userOrgId: normalOrg.id,
      venueId: venue.id,
    }

    prismaMock.userOnOrg.findFirst.mockResolvedValue(null)
    await expect(checkBookingPrivelege(booking)).resolves.toEqual(true)
  })

  test('check succeeds, admin user', async () => {
    const booking: BookingPayload = {
      eventName: 'test event',
      start: new Date(2021, 1, 2, 22, 30),
      end: new Date(2021, 1, 3, 23, 0),
      userId: admin.id,
      userOrgId: adminOrg.id,
      venueId: venue.id,
    }

    prismaMock.userOnOrg.findFirst.mockResolvedValue(adminUserOnOrg)
    await expect(checkBookingPrivelege(booking)).resolves.toEqual(true)
  })

  test('check fails', async () => {
    const booking: BookingPayload = {
      eventName: 'test event',
      start: new Date(2021, 1, 2, 20, 30),
      end: new Date(2021, 1, 3, 23, 0),
      userId: user.id,
      userOrgId: normalOrg.id,
      venueId: venue.id,
    }

    prismaMock.userOnOrg.findFirst.mockResolvedValue(null)
    await expect(checkBookingPrivelege(booking)).resolves.toEqual(false)
  })
})

describe('check conflicting booking', () => {
  // create a bookingpayload and add it to the database
  const booking: BookingPayload = {
    eventName: 'test event',
    start: new Date(2021, 1, 2, 22, 30),
    end: new Date(2021, 1, 2, 23, 0),
    userId: user.id,
    userOrgId: normalOrg.id,
    venueId: venue.id,
  }

  const nonConflictingBooking: Booking = {
    eventName: 'test event',
    id: 1,
    start: new Date(2021, 1, 2, 21, 30),
    end: new Date(2021, 1, 2, 22, 0), // End time before start of booking
    venueId: venue.id,
    userId: user.id,
    userOrgId: normalOrg.id,
    bookedAt: new Date(),
    bookedForOrgId: null,
    deleted: false,
  }

  const conflictingBooking: Booking = {
    eventName: 'test event',
    id: 2,
    start: new Date(2021, 1, 2, 22, 30),
    end: new Date(2021, 1, 2, 23, 0), // Booking overlaps with start of booking
    venueId: venue.id,
    userId: user.id,
    userOrgId: normalOrg.id,
    bookedAt: new Date(),
    bookedForOrgId: null,
    deleted: false,
  }

  test('check returns true for conflictingBooking', async () => {
    prismaMock.booking.findFirst.mockResolvedValue(conflictingBooking)
    await expect(checkConflictingBooking(booking)).resolves.toEqual(true)
  })

  test('check returns false for nonConflictingBooking', async () => {
    prismaMock.booking.findFirst.mockResolvedValue(nonConflictingBooking)
    await expect(checkConflictingBooking(booking)).resolves.toEqual(false)
  })
})

describe('check stacked bookings', () => {
  const date1 = new Date(2022, 1, 2, 22, 30)
  const date2 = new Date(2022, 1, 2, 23, 0)
  const date3 = new Date(
    date2.getTime() + MIN_SLOTS_BETWEEN_BOOKINGS * DURATION_PER_SLOT * 60 * 1000
  )
  const date4 = new Date(date3.getTime() + DURATION_PER_SLOT * 60 * 1000)

  const existingbooking: Booking = {
    eventName: 'test event',
    id: 1,
    start: date1,
    end: date2,
    userId: user.id,
    userOrgId: normalOrg.id,
    venueId: venue.id,
    bookedAt: new Date(),
    bookedForOrgId: null,
    deleted: false,
  }

  const validNewBooking: BookingPayload = {
    eventName: 'test event',
    start: date3,
    end: date4,
    userId: user.id,
    userOrgId: normalOrg.id,
    venueId: venue.id,
  }

  const invalidNewBooking: BookingPayload = {
    eventName: 'test event',
    start: date2,
    end: date3,
    userId: user.id,
    userOrgId: normalOrg.id,
    venueId: venue.id,
  }

  const existingAdminBooking: Booking = {
    id: 1,
    eventName: 'test event',
    start: date2,
    end: date3,
    userId: admin.id,
    userOrgId: adminOrg.id,
    venueId: venue.id,
    bookedAt: new Date(),
    bookedForOrgId: null,
    deleted: false,
  }

  const validAdminBooking: BookingPayload = {
    eventName: 'test event',
    start: date3,
    end: date4,
    userId: admin.id,
    userOrgId: adminOrg.id,
    venueId: venue.id,
  }

  test('check succeeds for second booking with gap after first booking', async () => {
    prismaMock.userOnOrg.findMany.mockResolvedValueOnce([])
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(existingbooking)
      .mockResolvedValueOnce(null)
    await expect(checkStackedBookings(validNewBooking)).resolves.toEqual(true)
  })

  test('check fails for stacked booking', async () => {
    prismaMock.userOnOrg.findMany.mockResolvedValueOnce([])
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(existingbooking)
      .mockResolvedValueOnce(null)
    await expect(checkStackedBookings(invalidNewBooking)).resolves.toEqual(
      false
    )
  })

  test('check succeeds for admin stacked booking', async () => {
    prismaMock.userOnOrg.findMany.mockResolvedValueOnce([adminUserOnOrg])
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(existingAdminBooking)
      .mockResolvedValueOnce(null)
    await expect(checkStackedBookings(validAdminBooking)).resolves.toEqual(true)
  })
})
