import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

/* Gets bookings by userId */
export default async function getBookingFromPrismaByUserId(userId: number) {
  const result = await prisma.booking.findMany({
    where: {
      userId: {
        equals: userId,
      },
    },
  })
  return result
}
