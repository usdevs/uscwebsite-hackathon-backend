import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

/* Gets bookings by userId */
export default async function getBookingFromPrismaByBookingId(
  bookingId: number
) {
  const result = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  })
  return result
}
