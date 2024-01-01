import { DURATION_PER_SLOT, MIN_SLOTS_PER_BOOKING } from '@/config/common'
import { Policy } from '@/interfaces/policy.interface'
import { BookingPayload } from '@/services/bookings'

export class AllowIfBookingIsNotTooShort implements Policy {
  private booking: BookingPayload

  constructor(booking: BookingPayload) {
    this.booking = booking
  }

  public Validate = async (): Promise<Decision> => {
    if (
      this.booking.end.getTime() - this.booking.start.getTime() <
      DURATION_PER_SLOT * MIN_SLOTS_PER_BOOKING * 1000 * 60
    ) {
      return 'deny'
    }
    return 'allow'
  }

  public Reason = () =>
    'Booking duration is too short, please change your booking request.'
}
