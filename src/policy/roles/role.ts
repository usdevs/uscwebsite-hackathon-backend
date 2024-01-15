import { Role } from '@prisma/client'

export const WebsiteAdmin: RoleName = 'website_admin'
export const SpacesAdmin: RoleName = 'spaces_admin'
export const AcadsAdmin: RoleName = 'acads_admin'
export const BookingAdmin: RoleName = 'booking_admin'
export const OrganisationHead: RoleName = 'organisation_head'
export const Member: RoleName = 'member'

// ID is hardcoded because it is the exact ID is expected by the
// orgRole seed in the seeding excel sheet.
export const WebsiteAdminRole: Omit<Role, 'createdAt'> = {
  id: 1,
  name: WebsiteAdmin,
}

export const SpacesAdminRole: Omit<Role, 'createdAt'> = {
  id: 2,
  name: SpacesAdmin,
}

export const AcadsAdminRole: Omit<Role, 'createdAt'> = {
  id: 3,
  name: AcadsAdmin,
}

export const BookingAdminRole: Omit<Role, 'createdAt'> = {
  id: 4,
  name: BookingAdmin,
}

export const OrganisationHeadRole: Omit<Role, 'createdAt'> = {
  id: 5,
  name: OrganisationHead,
}

export const MemberRole: Omit<Role, 'createdAt'> = {
  id: 6,
  name: Member,
}

/**
 * This is the list of all roles in the system.
 * It is used to seed the database with roles.
 * If you are adding a role, please add it here.
 */
export const AllRoles: Omit<Role, 'createdAt'>[] = [
  WebsiteAdminRole,
  SpacesAdminRole,
  AcadsAdminRole,
  BookingAdminRole,
  OrganisationHeadRole,
  MemberRole,
]
