import deleteBookingFromPrisma from '.'
import { prismaMock } from '../../singleton'

test('should delete a Booking ', async () => {
  const deletedBooking = {
    id: 4,
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
    bookedAt: new Date(2022, 12, 5, 20, 0),
  }

  prismaMock.booking.delete.mockResolvedValue(deletedBooking)

  // Fails but succesfully inserts
  await expect(deleteBookingFromPrisma(4)).resolves.toEqual({
    id: 4,
    venueId: 1,
    userId: 1,
    orgId: 1,
  })
})
