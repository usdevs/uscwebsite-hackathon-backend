import * as Policies from '../commonpolicies'
import * as Abilities from '../abilities'

/**
 * All users, even non-members, are allowed to view submissions.
 */
export const viewSubmissionPolicy = () => {
  return new Policies.Allow()
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

export const deleteSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canDeleteSubmission)
  )
}
