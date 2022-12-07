import { prismaMock } from './test/singleton'
import {
  addBooking,
  BookingPayload,
  deleteBooking,
  getBookingById,
  updateBooking,
} from './bookings'
import { generateRandomBooking } from './test/utils'
import { Booking } from '@prisma/client'

describe('add bookings', () => {
  test('add succeeds', async () => {
    const bookingToAdd: BookingPayload = {
      venueId: 1,
      userId: 1,
      orgId: 1,
      start: new Date(2022, 12, 6, 20, 0),
      end: new Date(2022, 12, 6, 20, 0),
    }

    const addedBooking: Booking = generateRandomBooking(bookingToAdd)
    prismaMock.booking.create.mockResolvedValue(addedBooking)

    await expect(addBooking(bookingToAdd)).resolves.toEqual({
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

    addBooking(testBooking)
    prismaMock.booking.delete.mockResolvedValue(testBooking)

    await expect(deleteBooking(testBooking.id)).resolves.toEqual(testBooking)
    await expect(getBookingById(testBooking.id)).resolves.toEqual(undefined)
  })

  test('delete should fail when id does not exists', async () => {
    prismaMock.booking.delete.mockRejectedValue(
      new Error('Record to be deleted does not exist')
    )

    await expect(deleteBooking(-1)).rejects.toEqual(expect.any(Error))
  })
})
