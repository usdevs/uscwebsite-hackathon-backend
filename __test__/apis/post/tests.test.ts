import { prismaMock } from '../../singleton'
import addBookingToPrisma from '.'

test('should create new Booking ', async () => {
  const addedBooking = {
    id: 1,
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
    bookedAt: new Date(),
  }

  const booking = {
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
  }

  prismaMock.booking.create.mockResolvedValue(addedBooking)

  // Use expects.any for arbitrary values
  await expect(addBookingToPrisma(booking)).resolves.toEqual({
    id: expect.any(Number),
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
    bookedAt: expect.any(Date),
  })
})
