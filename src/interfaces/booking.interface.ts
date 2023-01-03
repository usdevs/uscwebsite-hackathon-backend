import { z } from 'zod'

export const BookingSchema = z
  .object({
    venueId: z.number(),
    orgId: z.number(),
    userId: z.number(),
    start: z
      .string()
      .datetime()
      .refine((time) => {
        return new Date(time) < new Date(Date.now())
      }, 'Booking start time must be after the current time.'),
    end: z.string().datetime(),
  })
  .refine((obj) => {
    return new Date(obj.start) > new Date(obj.end)
  }, 'Booking end time must be after start time')
