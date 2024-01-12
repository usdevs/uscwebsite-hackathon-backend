import { Ability } from '@prisma/client'

export const canViewSubmissionList: AbilityName = 'canViewSubmissionList'
export const canCreateSubmission: AbilityName = 'canCreateSubmission'
export const canUpdateSubmission: AbilityName = 'canUpdateSubmission'
export const canDeleteSubmission: AbilityName = 'canDeleteSubmission'
export const canPublishSubmission: AbilityName = 'canApproveSubmission'

export const canViewSubmissionListAbility: Create<Ability> = {
  name: canViewSubmissionList,
  description: 'Can view submission list',
}

export const canCreateSubmissionAbility: Create<Ability> = {
  name: canCreateSubmission,
  description: 'Can create submission',
}

export const canUpdateSubmissionAbility: Create<Ability> = {
  name: canUpdateSubmission,
  description: 'Can update submission',
}

export const canDeleteSubmissionAbility: Create<Ability> = {
  name: canDeleteSubmission,
  description: 'Can delete submission',
}

export const canPublishSubmissionAbility: Create<Ability> = {
  name: canPublishSubmission,
  description: 'Can publish submission',
}

export const AllSubmissionAbilities: Create<Ability>[] = [
  canViewSubmissionListAbility,
  canCreateSubmissionAbility,
  canUpdateSubmissionAbility,
  canDeleteSubmissionAbility,
  canPublishSubmissionAbility,
]
