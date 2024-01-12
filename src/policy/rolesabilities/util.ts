import * as Roles from '@/policy/role'
import * as Abilities from '@/policy/abilities'

/**
 * This record is used to seed the roles and abilities.
 * It is a mapping of role to abilities that the role has.
 */
export const RolesAbilities: Record<RoleName, AbilityName[]> = {
  [Roles.WebsiteAdmin]: [Abilities.canManageAll],
  [Roles.MakerAdmin]: [
    Abilities.canViewAdminList,
    Abilities.canViewOrganisationList,
    Abilities.canViewBookingList,
    Abilities.canApproveMakerStudioBooking,
    Abilities.canViewSubmissionList,
  ],
  [Roles.AcadsAdmin]: [
    Abilities.canViewAdminList,
    Abilities.canViewOrganisationList,
    Abilities.canViewBookingList,
    Abilities.canViewSubmissionList,
    Abilities.canCreateSubmission,
    Abilities.canUpdateSubmission,
    Abilities.canDeleteSubmission,
  ],
  [Roles.BookingAdmin]: [
    Abilities.canViewAdminList,
    Abilities.canViewOrganisationList,
    Abilities.canViewBookingList,
    Abilities.canCreateBooking,
    Abilities.canDeleteBooking,
    Abilities.canUpdateBooking,
    Abilities.canApproveMakerStudioBooking,
    Abilities.canRejectMakerStudioBooking,
    Abilities.canViewSubmissionList,
  ],
  [Roles.OrganisationHead]: [
    Abilities.canViewAdminList,
    Abilities.canViewOrganisationList,
    Abilities.canViewBookingList,
    Abilities.canViewSubmissionList,
  ],
  [Roles.Member]: [
    Abilities.canViewBookingList,
    Abilities.canViewSubmissionList,
  ],
}
