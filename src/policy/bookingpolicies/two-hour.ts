import { Policy } from '@/interfaces/policy.interface'
import { BookingPayload } from '@/services/bookings'

export class AllowIfBookingLessThanTwoHours implements Policy {
  private booking: BookingPayload

  constructor(booking: BookingPayload) {
    this.booking = booking
  }
  public Validate = async (): Promise<Decision> => {
    const duration = this.booking.end.getTime() - this.booking.start.getTime()
    if (duration > 2 * 60 * 60 * 1000) return 'deny'
    return 'allow'
  }

  public Reason = () => 'Booking duration is longer than 2 hours.'
}
