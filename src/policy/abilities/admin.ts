import { Ability } from '@prisma/client'

export const canManageAll: AbilityName = 'canManageAll'
export const canViewAdminList: AbilityName = 'canViewAdminList'
export const canViewOrganisationList: AbilityName = 'canViewOrganisationList'
export const canCreateAdmin: AbilityName = 'canCreateAdmin'
export const canDeleteAdmin: AbilityName = 'canDeleteAdmin'
export const canCreateOrganisation: AbilityName = 'canCreateOrganisation'
export const canDeleteOrganisation: AbilityName = 'canDeleteOrganisation'

export const canManageAllAbility: Omit<Ability, 'createdAt'> = {
  id: 1,
  name: canManageAll,
  description: 'Can manage all',
}

export const canViewAdminListAbility: Omit<Ability, 'createdAt'> = {
  id: 2,
  name: canViewAdminList,
  description: 'Can view admin list',
}

export const canViewOrganisationListAbility: Omit<Ability, 'createdAt'> = {
  id: 3,
  name: canViewOrganisationList,
  description: 'Can view organisation list',
}

export const canCreateAdminAbility: Omit<Ability, 'createdAt'> = {
  id: 4,
  name: canCreateAdmin,
  description: 'Can create admin',
}

export const canDeleteAdminAbility: Omit<Ability, 'createdAt'> = {
  id: 5,
  name: canDeleteAdmin,
  description: 'Can delete admin',
}

export const canCreateOrganisationAbility: Omit<Ability, 'createdAt'> = {
  id: 6,
  name: canCreateOrganisation,
  description: 'Can create organisation',
}

export const canDeleteOrganisationAbility: Omit<Ability, 'createdAt'> = {
  id: 7,
  name: canDeleteOrganisation,
  description: 'Can delete organisation',
}

export const AllAdminAbilities: Omit<Ability, 'createdAt'>[] = [
  canManageAllAbility,
  canViewAdminListAbility,
  canViewOrganisationListAbility,
  canCreateAdminAbility,
  canDeleteAdminAbility,
  canCreateOrganisationAbility,
  canDeleteOrganisationAbility,
]
