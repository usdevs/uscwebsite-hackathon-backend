import { Policy } from '@/interfaces/policy.interface'
import { BookingPayload } from '@/services/bookings'
import { User } from '@prisma/client'

export class AllowIfBookingBelongToUser implements Policy {
  private booking: BookingPayload
  private user: User

  constructor(booking: BookingPayload, user: User) {
    this.booking = booking
    this.user = user
  }

  public Validate = async (): Promise<Decision> => {
    if (this.booking.userId !== this.user.id) return 'deny'
    return 'allow'
  }

  public Reason = () => `This booking does not belong to you.`
}
