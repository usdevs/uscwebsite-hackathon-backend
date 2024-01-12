import * as Policies from '../commonpolicies'
import * as Abilities from '../abilities'

export const viewSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canViewSubmissionList)
  )
}

export const createSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canCreateSubmission)
  )
}

export const updateSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canUpdateSubmission)
  )
}

export const publishSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canPublishSubmission)
  )
}

export const deleteSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canDeleteSubmission)
  )
}
