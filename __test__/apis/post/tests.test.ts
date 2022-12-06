import { prismaMock } from '../../singleton'
import addBookingToPrisma from './addBookingToPrisma'

test('should create new Booking ', async () => {
  const addedBooking = {
    id: 1,
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
    bookedAt: new Date(2022, 12, 5, 20, 0),
  }

  const booking = {
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
  }

  prismaMock.booking.create.mockResolvedValue(addedBooking)

  // Fails but succesfully inserts
  await expect(addBookingToPrisma(booking)).resolves.toEqual({
    id: 1,
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
    bookedAt: new Date(2022, 12, 5, 20, 0),
  })
})
