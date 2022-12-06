import updateBookingToPrisma from '.'
import { prismaMock } from '../../singleton'
import addBookingToPrisma from '../post'

// this test cases runs long
jest.setTimeout(30000)

test('should update an existing Booking ', async () => {
  const booking = {
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
  }

  const result = await addBookingToPrisma(booking)
  // update booking
  const updatedBooking = { ...result }
  updatedBooking.venueId = 2

  prismaMock.booking.update.mockResolvedValue(updatedBooking)

  await expect(
    updateBookingToPrisma(result.id, updatedBooking)
  ).resolves.toEqual({
    ...updatedBooking,
  })
})
