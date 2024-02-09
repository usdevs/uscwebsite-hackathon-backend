import { prismaMock } from './test/singleton'
import {
  addBooking,
  BookingPayload,
  destroyBooking,
  getBookingById,
} from './bookings'
import {
  generateRandomBooking,
  generateRandomOrganisation,
  generateRandomUser,
  generateUserOnOrg,
} from './test/utils'
import { Booking, UserOnOrg } from '@prisma/client'
import {
  checkConflictingBooking,
  checkIsUserAdmin,
  checkIsUserBookingAdmin,
  checkStackedBookings,
} from '../middlewares/checks'
import { HttpCode, HttpException } from '../exceptions/HttpException'

// Mock the bookings checks
jest.mock('../middlewares/checks', () => ({
  checkConflictingBooking: jest.fn(),
  checkIsUserBookingAdmin: jest.fn(),
  checkStackedBookings: jest.fn(),
}))

beforeEach(() => {
  jest.resetAllMocks()
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

    const result = addBooking(bookingToAdd)

    await expect(result).resolves.toEqual({
      ...addedBooking,
      id: expect.any(Number),
      bookedAt: expect.any(Date),
    })
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
    prismaMock.booking.delete.mockResolvedValue(testBooking)

    await expect(
      destroyBooking(testBooking.id, testBooking.userId)
    ).resolves.toEqual(testBooking)
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
