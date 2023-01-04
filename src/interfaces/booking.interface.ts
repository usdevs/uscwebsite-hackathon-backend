import { DURATION_PER_SLOT } from '@/config/common'
import { z } from 'zod'

export const BookingSchema = z
  .object({
    venueId: z.number(),
    orgId: z.number(),
    start: z
      .preprocess((arg) => {
        if (typeof arg == 'string' || arg instanceof Date) {
          const result =  new Date(arg)
          result.setMinutes(result.getMinutes() - result.getMinutes() % DURATION_PER_SLOT, 0, 0)
          return result
        }
      }, z.date())
      .refine((time) => {
        return time.getTime() > Date.now()
      }, 'Booking start time must be after the current time.'),
    end: z.preprocess((arg) => {
      if (typeof arg == 'string' || arg instanceof Date) {
          const result =  new Date(arg)
          result.setMinutes(result.getMinutes() - result.getMinutes() % DURATION_PER_SLOT, 0, 0)
          return result
      }
    }, z.date()),
  })
  .refine((obj) => {
    return obj.start.getTime() < obj.end.getTime()
  }, 'Booking end time must be after start time')
