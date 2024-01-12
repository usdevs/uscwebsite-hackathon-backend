import { Ability } from '@prisma/client'
import * as admin from './admin'
import * as booking from './booking'
import * as submission from './submission'

export const GetAllAbilities = (): Create<Ability>[] => {
  const adminAbilities = admin.AllAdminAbilities
  const bookingAbilities = booking.AllBookingAbilities
  const submissionAbilities = submission.AllSubmissionAbilities
  return [...adminAbilities, ...bookingAbilities, ...submissionAbilities]
}
