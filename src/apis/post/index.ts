import { PrismaClient } from '@prisma/client'
import { Booking } from 'src/types'

const prisma = new PrismaClient({})

/* Adds one booking */
export default async function addBookingToPrisma(new_booking: Booking) {
  const result = await prisma.booking.create({
    data: new_booking,
  })
  return result
}
