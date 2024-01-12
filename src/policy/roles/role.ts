import { Role } from '@prisma/client'

export const WebsiteAdmin: RoleName = 'website_admin'
export const MakerAdmin: RoleName = 'maker_admin'
export const AcadsAdmin: RoleName = 'acads_admin'
export const BookingAdmin: RoleName = 'booking_admin'
export const OrganisationHead: RoleName = 'organisation_head'
export const Member: RoleName = 'member'

export const WebsiteAdminRole: Omit<Role, 'createdAt'> = {
  id: 1,
  name: WebsiteAdmin,
}

export const MakerAdminRole: Omit<Role, 'createdAt'> = {
  id: 2,
  name: MakerAdmin,
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
  MakerAdminRole,
  AcadsAdminRole,
  BookingAdminRole,
  OrganisationHeadRole,
  MemberRole,
]
