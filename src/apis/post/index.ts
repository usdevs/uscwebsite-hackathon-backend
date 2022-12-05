import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export default async function addBookingToPrisma(
  venueId: number,
  userId: number,
  orgId: number,
  start: Date,
  end: Date
) {
  const result = await prisma.booking.create({
    data: {
      venueId: venueId,
      userId: userId,
      orgId: orgId,
      start: start,
      end: end,
    },
  })
  return result
}
