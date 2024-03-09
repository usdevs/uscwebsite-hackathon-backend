import { Policy } from '@/interfaces/policy.interface'
import { BookingPayload } from '@/services/bookings'
import { getUserRoles } from '@/services/users'
import { getVenueRoles } from '@/services/venues'
import { User, type Venue, type Role } from '@prisma/client'

/**
 * Specific {@link Role}s are considered admins for certain {@link Venue}s.
 * This means the user is allowed to perform CRUD operations on bookings for that venue.
 */
export class AllowIfAdminForVenue implements Policy {
  private booking: BookingPayload
  private reason: string = ''

  constructor(booking: BookingPayload) {
    this.booking = booking
  }

  public Validate = async (u?: User): Promise<Decision> => {
    if (!u) {
      this.reason = 'User is not logged in'
      return 'deny'
    }

    const roles = await getUserRoles(u.id)
    const venueRole = await getVenueRoles(this.booking.venueId)
    const venueRoleNames = venueRole.map((r) => r.name)
    const venueRoleSet = new Set(venueRoleNames)

    const hasRole = roles.some((r) => venueRoleSet.has(r.name))

    if (!hasRole) {
      this.reason = `User does not have any of the following roles: ${venueRoleNames.join(
        ', '
      )}`
    }

    return hasRole ? 'allow' : 'deny'
  }

  public Reason = () => this.reason
}
