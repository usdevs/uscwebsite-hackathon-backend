import { DURATION_PER_SLOT, MIN_SLOTS_BETWEEN_BOOKINGS } from '@/config/common'
import { Policy } from '@/interfaces/policy.interface'
import { checkStackedBookings } from '@/middlewares/checks'
import { BookingPayload } from '@/services/bookings'

export class AllowIfBookingIsNotStacked implements Policy {
  private booking: BookingPayload

  constructor(booking: BookingPayload) {
    this.booking = booking
  }

  public Validate = async (): Promise<Decision> => {
    if (!(await checkStackedBookings(this.booking))) return 'deny'
    return 'allow'
  }

  public Reason = () =>
    `Please leave a duration of at least ${
      DURATION_PER_SLOT * MIN_SLOTS_BETWEEN_BOOKINGS
    } minutes in between consecutive bookings`
}
