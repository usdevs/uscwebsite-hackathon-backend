import { Ability } from '@prisma/client'

export const canManageAll: AbilityName = 'canManageAll'
export const canViewAdminList: AbilityName = 'canViewAdminList'
export const canCreateAdmin: AbilityName = 'canCreateAdmin'
export const canDeleteAdmin: AbilityName = 'canDeleteAdmin'
export const canCreateOrganisation: AbilityName = 'canCreateOrganisation'
export const canDeleteOrganisation: AbilityName = 'canDeleteOrganisation'

export const canManageAllAbility: Create<Ability> = {
  name: canManageAll,
  description: 'Can manage all',
}

export const canViewAdminListAbility: Create<Ability> = {
  name: canViewAdminList,
  description: 'Can view admin list',
}

export const canCreateAdminAbility: Create<Ability> = {
  name: canCreateAdmin,
  description: 'Can create admin',
}

export const canDeleteAdminAbility: Create<Ability> = {
  name: canDeleteAdmin,
  description: 'Can delete admin',
}

export const canCreateOrganisationAbility: Create<Ability> = {
  name: canCreateOrganisation,
  description: 'Can create organisation',
}

export const canDeleteOrganisationAbility: Create<Ability> = {
  name: canDeleteOrganisation,
  description: 'Can delete organisation',
}

export const AllAdminAbilities: Create<Ability>[] = [
  canManageAllAbility,
  canViewAdminListAbility,
  canCreateAdminAbility,
  canDeleteAdminAbility,
  canCreateOrganisationAbility,
  canDeleteOrganisationAbility,
]
