import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

/* Deletes one booking */
export default async function deleteBookingFromPrisma(id: number) {
  const result = await prisma.booking.delete({
    where: {
      id: id,
    },
  })
  return result
}
