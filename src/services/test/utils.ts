import { Booking } from '@prisma/client'
import { faker } from '@faker-js/faker'

// range: [1..]
const generateRandomTableId: () => number = () =>
  faker.datatype.number({ min: 1 })

export function generateRandomBooking(booking: Partial<Booking>): Booking {
  return {
    id: generateRandomTableId(),
    venueId: generateRandomTableId(),
    orgId: generateRandomTableId(),
    userId: generateRandomTableId(),
    start: faker.datatype.datetime(),
    end: faker.datatype.datetime(),
    bookedAt: faker.datatype.datetime(),
    ...booking,
  }
}
