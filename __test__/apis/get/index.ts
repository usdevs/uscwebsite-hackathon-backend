import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

/* Gets bookings by either bookingId or userId */
export default async function getBookingFromPrisma(userId: number, id: number) {
  const result = await prisma.booking.findMany({
    where: {
      OR: [
        {
          userId: {
            equals: userId,
          },
          id: {
            equals: id,
          },
        },
      ],
    },
  })
  return result
}
