import { PrismaClient } from '@prisma/client'
import { Booking } from 'src/types'

const prisma = new PrismaClient({})

/* Updates booking information */
export default async function updateBookingToPrisma(
  id: number,
  new_booking: Booking
) {
  const result = await prisma.booking.update({
    where: {
      id: id,
    },
    data: new_booking,
  })
  return result
}
