import { prismaMock } from '../../singleton'
import deleteBookingFromPrisma from '.'
import addBookingToPrisma from '../post'

test('should fail to delete a Booking ', async () => {
  prismaMock.booking.create.mockRejectedValue(
    new Error('Record to be deleted does not exist')
  )

  await expect(deleteBookingFromPrisma(-1)).rejects.toEqual(expect.any(Error))
})

jest.setTimeout(30000)
test('should delete a Booking ', async () => {
  const booking = {
    venueId: 1,
    userId: 1,
    orgId: 1,
    start: new Date(2022, 12, 6, 20, 0),
    end: new Date(2022, 12, 6, 20, 0),
  }

  // create a booking and obtain its id
  const result = await addBookingToPrisma(booking)

  prismaMock.booking.delete.mockResolvedValue(result)

  await expect(deleteBookingFromPrisma(result.id)).resolves.toEqual(result)
})
