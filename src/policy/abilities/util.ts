import * as admin from './admin'
import * as booking from './booking'
import * as submission from './submission'

/**
 * This is the list of all abilities in the system.
 * It is used to seed the database with abilities.
 * If you are adding a cluster of abilties, please add it here.
 */
export const AllAbilities = [
  ...admin.AllAdminAbilities,
  ...booking.AllBookingAbilities,
  ...submission.AllSubmissionAbilities,
]
