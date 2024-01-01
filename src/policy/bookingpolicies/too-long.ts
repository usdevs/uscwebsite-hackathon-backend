import { DURATION_PER_SLOT, MAX_SLOTS_PER_BOOKING } from '@/config/common'
import { Policy } from '@/interfaces/policy.interface'
import { BookingPayload } from '@/services/bookings'

export class AllowIfBookingIsNotTooLong implements Policy {
  private booking: BookingPayload

  constructor(booking: BookingPayload) {
    this.booking = booking
  }

  public Validate = async (): Promise<Decision> => {
    if (
      this.booking.end.getTime() - this.booking.start.getTime() >
      DURATION_PER_SLOT * MAX_SLOTS_PER_BOOKING * 1000 * 60
    ) {
      return 'deny'
    }
    return 'allow'
  }

  public Reason = () =>
    'Booking duration is too long, please change your booking request.'
}
