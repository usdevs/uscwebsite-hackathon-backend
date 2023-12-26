import { Policy } from '@/interfaces/policy.interface'
import * as Policies from '../commonpolicies'
import * as Abilitis from '../abilities'

export const viewSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canViewSubmissionList)
  )
}

export const createSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canCreateSubmission)
  )
}

export const updateSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canUpdateSubmission)
  )
}

export const publishSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canPublishSubmission)
  )
}

export const deleteSubmissionPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canDeleteSubmission)
  )
}
