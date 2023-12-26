import * as Policies from '../commonpolicies'
import * as Abilities from '../abilities'

export const viewAdminListPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canViewAdminList)
  )
}

export const viewOrganisationListPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canViewOrganisationList)
  )
}

export const createAdminPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canCreateAdmin)
  )
}

export const deleteAdminPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canDeleteAdmin)
  )
}
