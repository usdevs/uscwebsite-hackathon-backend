import * as Roles from '@/policy/roles'
import * as Abilities from '@/policy/abilities'
import { type VenueAdminRole } from '@prisma/client'

/**
 * This record is used to seed the roles and abilities.
 * It is a mapping of role to abilities that the role has.
 *
 * Note: not all permissions are captured here. Permissions relating to specific venues
 * are captured in the {@link VenueAdminRole} model.
 */
export const RolesAbilities: Record<RoleName, AbilityName[]> = {
  [Roles.WebsiteAdmin]: [Abilities.canManageAll],
  [Roles.SpacesAdmin]: [
    Abilities.canViewAdminList,
    Abilities.canViewBookingList,
    Abilities.canApproveBooking,
    Abilities.canRejectBooking,
    Abilities.canViewSubmissionList,
  ],
  [Roles.AcadsAdmin]: [
    Abilities.canViewAdminList,
    Abilities.canViewBookingList,
    Abilities.canViewSubmissionList,
    Abilities.canCreateSubmission,
    Abilities.canUpdateSubmission,
    Abilities.canDeleteSubmission,
  ],
  [Roles.BookingAdmin]: [
    Abilities.canViewAdminList,
    Abilities.canViewBookingList,
    Abilities.canCreateBooking,
    Abilities.canDeleteBooking,
    Abilities.canUpdateBooking,
    Abilities.canApproveBooking,
    Abilities.canRejectBooking,
    Abilities.canViewSubmissionList,
  ],
  [Roles.OrganisationHead]: [
    Abilities.canViewAdminList,
    Abilities.canViewBookingList,
    Abilities.canViewSubmissionList,
  ],
  [Roles.Member]: [
    Abilities.canViewBookingList,
    Abilities.canViewSubmissionList,
  ],
  [Roles.ButteryAdmin]: [
    Abilities.canViewBookingList,
    Abilities.canViewSubmissionList,
  ],
}
