import { prismaMock } from './test/singleton'
import {
  addBooking,
  BookingPayload,
  destroyBooking,
  getAllBookings,
  getBookingById,
  getUserBookings,
} from './bookings'
import {
  generateRandomBooking,
  generateRandomOrganisation,
  generateRandomUser,
  generateUserOnOrg,
} from './test/utils'
import { Booking } from '@prisma/client'
import {
  checkConflictingBooking,
  checkIsUserBookingAdmin,
  checkIsUserInOrg,
  checkStackedBookings,
} from '../middlewares/checks'
import { HttpCode, HttpException } from '../exceptions/HttpException'

// Mock the bookings checks
jest.mock('../middlewares/checks', () => ({
  checkConflictingBooking: jest.fn(),
  checkIsUserBookingAdmin: jest.fn(),
  checkStackedBookings: jest.fn(),
  checkIsUserInOrg: jest.fn(),
}))

beforeEach(() => {
  jest.resetAllMocks()
})

describe('Test getAllBookings', () => {
  test('should return all bookings within the date range', async () => {
    const startDate = new Date(2022, 11, 1)
    const endDate = new Date(2022, 11, 31)

    const bookings = [
      generateRandomBooking({ start: startDate, end: endDate }),
      generateRandomBooking({ start: startDate, end: endDate }),
    ]

    prismaMock.booking.findMany.mockResolvedValue(bookings)

    const result = await getAllBookings(startDate, endDate)

    expect(result).toEqual(bookings)
    expect(prismaMock.booking.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            OR: [
              {
                start: {
                  gte: startDate,
                  lte: endDate,
                },
                end: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            ],
          },
          {
            deleted: { not: true },
          },
        ],
      },
      orderBy: { start: 'asc' },
      include: {
        venue: true,
        bookedBy: {
          include: {
            org: true,
            user: true,
          },
        },
        bookedForOrg: true,
      },
    })
  })

  test('should return an empty array when no bookings exist', async () => {
    const startDate = new Date(2022, 11, 1)
    const endDate = new Date(2022, 11, 31)

    prismaMock.booking.findMany.mockResolvedValue([])

    const result = await getAllBookings(startDate, endDate)

    expect(result).toEqual([])
    expect(prismaMock.booking.findMany).toHaveBeenCalledTimes(1)
  })
})

describe('Test getUserBookings', () => {
  test('should return all bookings for a given user', async () => {
    const userId = 1

    const bookings = [
      generateRandomBooking({ userId }),
      generateRandomBooking({ userId }),
    ]

    prismaMock.booking.findMany.mockResolvedValue(bookings)

    const result = await getUserBookings(userId)

    expect(result).toEqual(bookings)
    expect(prismaMock.booking.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { userId },
          { deleted: { not: true } },
        ],
      },
    })
  })

  test('should return an empty array when no bookings exist for the user', async () => {
    const userId = 1

    prismaMock.booking.findMany.mockResolvedValue([])

    const result = await getUserBookings(userId)

    expect(result).toEqual([])
    expect(prismaMock.booking.findMany).toHaveBeenCalledTimes(1)
  })
})

describe('Test getBookingById', () => {
  test('should return a booking by id', async () => {
    const bookingId = 1
    const booking = generateRandomBooking({ id: bookingId })

    prismaMock.booking.findFirstOrThrow.mockResolvedValue(booking)

    const result = await getBookingById(bookingId)

    expect(result).toEqual(booking)
    expect(prismaMock.booking.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        AND: [
          { id: { equals: bookingId } },
          { deleted: { not: true } },
        ],
      },
      include: {
        venue: true,
        bookedBy: true,
      },
    })
  })
})

describe('add bookings', () => {
  test('add succeeds', async () => {
    const user = generateRandomUser()
    const org = generateRandomOrganisation()
    const userOnOrg = generateUserOnOrg(user, org)
    const bookingToAdd: BookingPayload = {
      eventName: 'test event',
      venueId: 1,
      userId: user.id,
      userOrgId: org.id,
      start: new Date(2022, 12, 6, 20, 0),
      end: new Date(2022, 12, 6, 21, 0),
    }

    const addedBooking: Booking = generateRandomBooking(bookingToAdd)
    // Mock the booking to be returned
    prismaMock.booking.create.mockResolvedValue(addedBooking)
    // Mock the UserOnOrg
    prismaMock.userOnOrg.findFirst.mockResolvedValue(userOnOrg)
    // Mock the venue lookup
    prismaMock.venue.findFirst.mockResolvedValue({
      id: 1,
      name: 'test venue',
    })

    // Mock middleware checks
    jest.mocked(checkConflictingBooking).mockResolvedValue(false)
    jest.mocked(checkIsUserBookingAdmin).mockResolvedValue(false)
    jest.mocked(checkStackedBookings).mockResolvedValue(true)
    jest.mocked(checkIsUserInOrg).mockResolvedValue(true)

    const result = addBooking(bookingToAdd)

    await expect(result).resolves.toEqual({
      ...addedBooking,
      id: expect.any(Number),
      bookedAt: expect.any(Date),
    })
  })

  test('should handle database error during booking creation', async () => {
    const user = generateRandomUser()
    const org = generateRandomOrganisation()
    const bookingToAdd: BookingPayload = {
      eventName: 'db error test',
      venueId: 1,
      userId: user.id,
      userOrgId: org.id,
      start: new Date(2024, 9, 20, 10, 0),
      end: new Date(2024, 9, 20, 12, 0),
    }

    // Mock the UserOnOrg and venue lookup
    prismaMock.userOnOrg.findFirst.mockResolvedValue(generateUserOnOrg(user, org))
    prismaMock.venue.findFirst.mockResolvedValue({
      id: 1,
      name: 'test venue',
    })

    // Mock middleware checks
    jest.mocked(checkConflictingBooking).mockResolvedValue(false)
    jest.mocked(checkIsUserBookingAdmin).mockResolvedValue(false)
    jest.mocked(checkStackedBookings).mockResolvedValue(true)
    jest.mocked(checkIsUserInOrg).mockResolvedValue(true)

    // Mock Prisma to throw an error
    prismaMock.booking.create.mockRejectedValue(new Error('Database error'))

    await expect(addBooking(bookingToAdd)).rejects.toThrow('Database error')
  })
})

describe('delete bookings', () => {
  test('delete succeeds', async () => {
    const testBooking = generateRandomBooking({
      start: new Date(2022, 12, 6, 20, 0),
      end: new Date(2022, 12, 6, 22, 0),
    })

    prismaMock.venue.findFirst.mockResolvedValue({
      id: 1,
      name: 'test venue',
    })

    prismaMock.booking.findFirst.mockResolvedValueOnce(testBooking)
    prismaMock.booking.update.mockResolvedValue({
      ...testBooking,
      deleted: true,
    })

    await expect(
      destroyBooking(testBooking.id, testBooking.userId)
    ).resolves.toEqual({
      ...testBooking,
      deleted: true,
    })
    await expect(getBookingById(testBooking.id)).resolves.toEqual(undefined)
  })

  test('delete should fail when id does not exist', async () => {
    const bookingId = 1
    const userId = 1

    // Mock the prisma.booking.findFirst function to return null
    prismaMock.booking.findFirst.mockResolvedValue(null)

    try {
      // Call the function and expect it to reject with an HttpException
      await destroyBooking(bookingId, userId)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
      expect(error).toHaveProperty(
        'message',
        `Could not find booking with id ${bookingId}`
      )
      expect(error).toHaveProperty('status', HttpCode.BadRequest)
    }
  })
})
