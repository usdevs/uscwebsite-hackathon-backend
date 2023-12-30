import { Ability } from '@prisma/client'

export const canViewSubmissionList: AbilityName = 'canViewSubmissionList'
export const canCreateSubmission: AbilityName = 'canCreateSubmission'
export const canUpdateSubmission: AbilityName = 'canUpdateSubmission'
export const canDeleteSubmission: AbilityName = 'canDeleteSubmission'
export const canPublishSubmission: AbilityName = 'canApproveSubmission'

export const canViewSubmissionListAbility: Omit<Ability, 'createdAt'> = {
  id: 14,
  name: canViewSubmissionList,
  description: 'Can view submission list',
}

export const canCreateSubmissionAbility: Omit<Ability, 'createdAt'> = {
  id: 15,
  name: canCreateSubmission,
  description: 'Can create submission',
}

export const canUpdateSubmissionAbility: Omit<Ability, 'createdAt'> = {
  id: 16,
  name: canUpdateSubmission,
  description: 'Can update submission',
}

export const canDeleteSubmissionAbility: Omit<Ability, 'createdAt'> = {
  id: 17,
  name: canDeleteSubmission,
  description: 'Can delete submission',
}

export const canPublishSubmissionAbility: Omit<Ability, 'createdAt'> = {
  id: 18,
  name: canPublishSubmission,
  description: 'Can publish submission',
}

export const AllSubmissionAbilities: Omit<Ability, 'createdAt'>[] = [
  canViewSubmissionListAbility,
  canCreateSubmissionAbility,
  canUpdateSubmissionAbility,
  canDeleteSubmissionAbility,
  canPublishSubmissionAbility,
]
