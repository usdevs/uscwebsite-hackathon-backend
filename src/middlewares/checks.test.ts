import { User, Organisation, UserOnOrg, Venue } from '@prisma/client'
import { DURATION_PER_SLOT, MIN_SLOTS_BETWEEN_BOOKINGS } from '../config/common'
import { addBooking, BookingPayload } from '../services/bookings'
import { prisma } from '../../db'

import {
  generateRandomAdminOrganisation,
  generateRandomOrganisation,
  generateRandomUser,
  generateRandomVenue,
  generateUserOnOrg,
} from '../services/test/utils'

import {
  checkUserinOrg,
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

async function setup() {
  await prisma.user.create({ data: user })
  await prisma.user.create({ data: admin })
  await prisma.organisation.create({ data: normalOrg })
  await prisma.organisation.create({ data: adminOrg })
  await prisma.userOnOrg.create({ data: normalUserOnOrg })
  await prisma.userOnOrg.create({ data: adminUserOnOrg })
  await prisma.venue.create({ data: venue })
}

async function teardown() {
  await prisma.booking.deleteMany({})
  await prisma.venue.deleteMany({})
  await prisma.userOnOrg.deleteMany({})
  await prisma.organisation.deleteMany({})
  await prisma.user.deleteMany({})
}

describe('check user is in organisation', () => {
  jest.setTimeout(10000000)
  test('set up', async () => {
    await setup()
  })

  test.only('check succeeds', async () => {
    await expect(checkUserinOrg(user, normalOrg)).resolves.toEqual(true)
  })

  test('check succeeds for admin', async () => {
    await expect(checkUserinOrg(admin, normalOrg)).resolves.toEqual(true)
  })

  test('check fails', async () => {
    await expect(checkUserinOrg(user, adminOrg)).resolves.toEqual(false)
  })
})

describe('check start and end time', () => {
  test('check succeeds', () => {
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

describe('check booking privelege', () => {
  test('check succeeds, normal user', async () => {
    const booking: BookingPayload = {
      eventName: 'test event',
      start: new Date(2021, 1, 2, 22, 30),
      end: new Date(2021, 1, 2, 23, 0),
      userId: user.id,
      userOrgId: normalOrg.id,
      venueId: venue.id,
    }

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

    await expect(checkBookingPrivelege(booking)).resolves.toEqual(true)
  })

  test('check fails', async () => {
    const booking: BookingPayload = {
      eventName: 'test event',
      start: new Date(2021, 1, 2, 22, 30),
      end: new Date(2021, 1, 3, 23, 0),
      userId: user.id,
      userOrgId: normalOrg.id,
      venueId: venue.id,
    }

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

  const nonConflictingBooking: BookingPayload = {
    eventName: 'test event',
    start: new Date(2021, 1, 3, 21, 30),
    end: new Date(2021, 1, 3, 23, 0),
    venueId: venue.id,
    userId: user.id,
    userOrgId: normalOrg.id,
  }

  const conflictingBooking: BookingPayload = {
    eventName: 'test event',
    start: new Date(2021, 1, 2, 22, 30),
    end: new Date(2021, 1, 2, 23, 0),
    venueId: venue.id,
    userId: user.id,
    userOrgId: normalOrg.id,
  }

  test('check succeeds', async () => {
    await addBooking(booking)

    await expect(
      checkConflictingBooking(nonConflictingBooking)
    ).resolves.toEqual(true)
  })

  test('check fails', async () => {
    await expect(checkConflictingBooking(conflictingBooking)).resolves.toEqual(
      false
    )
  })
})

describe('check stacked bookings', () => {
  const date1 = new Date(2022, 1, 2, 22, 30)
  const date2 = new Date(2022, 1, 2, 23, 0)
  const date3 = new Date(
    date2.getTime() + MIN_SLOTS_BETWEEN_BOOKINGS * DURATION_PER_SLOT * 60 * 1000
  )
  const date4 = new Date(date3.getTime() + DURATION_PER_SLOT * 60 * 1000)

  const existingbooking: BookingPayload = {
    eventName: 'test event',
    start: date1,
    end: date2,
    userId: user.id,
    userOrgId: normalOrg.id,
    venueId: venue.id,
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

  const existingAdminBooking: BookingPayload = {
    eventName: 'test event',
    start: date2,
    end: date3,
    userId: admin.id,
    userOrgId: adminOrg.id,
    venueId: venue.id,
  }

  const validAdminBooking: BookingPayload = {
    eventName: 'test event',
    start: date3,
    end: date4,
    userId: admin.id,
    userOrgId: adminOrg.id,
    venueId: venue.id,
  }

  test('check succeeds', async () => {
    await addBooking(existingbooking)

    await expect(checkStackedBookings(validNewBooking)).resolves.toEqual(true)
  })

  test('check fails', async () => {
    await expect(checkStackedBookings(invalidNewBooking)).resolves.toEqual(
      false
    )
  })

  test('check succeeds', async () => {
    await addBooking(existingAdminBooking)

    await expect(checkStackedBookings(validAdminBooking)).resolves.toEqual(true)
  })

  jest.setTimeout(10000000)
  test('teardown', async () => {
    await teardown()
  })
})
