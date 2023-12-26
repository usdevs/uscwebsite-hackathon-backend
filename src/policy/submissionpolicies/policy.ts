import { Policy } from '@/interfaces/policy.interface'
import * as Policies from '../commonpolicies'
import * as Abilitis from '../abilities'

export const viewAdminListPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canViewAdminList)
  )
}

export const viewOrganisationListPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canViewOrganisationList)
  )
}

export const createAdminPolicy = () => {
  return new Policies.Any(new Policies.HasAnyAbilities(Abilitis.canCreateAdmin))
}

export const deleteAdminPolicy = () => {
  return new Policies.Any(new Policies.HasAnyAbilities(Abilitis.canDeleteAdmin))
}
