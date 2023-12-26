import { Policy } from '@/interfaces/policy.interface'
import { User } from '@prisma/client'

export class AllowIfBookingLessThanTwoHours implements Policy {
  private start: Date
  private end: Date

  constructor(start: Date, end: Date) {
    this.start = start
    this.end = end
  }

  public Validate = async (u?: User): Promise<Decision> => {
    const duration = this.end.getTime() - this.start.getTime()
    if (duration > 2 * 60 * 60 * 1000) return 'deny'
    return 'allow'
  }

  public Reason = () => 'Booking duration is longer than 2 hours.'
}
