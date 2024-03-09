import { Policy } from '@/interfaces/policy.interface'
import { BookingPayload } from '@/services/bookings'

export class AllowIfBookingWithin14Days implements Policy {
  private booking: BookingPayload

  constructor(booking: BookingPayload) {
    this.booking = booking
  }

  public Validate = async (): Promise<Decision> => {
    if (
      this.booking.start.getTime() - new Date().getTime() >
      14 * 24 * 60 * 60 * 1000
    ) {
      return 'deny'
    }
    return 'allow'
  }

  public Reason = () => 'You can only book up to 14 days in advance'
}
