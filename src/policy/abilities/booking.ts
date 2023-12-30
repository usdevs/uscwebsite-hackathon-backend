import { Ability } from '@prisma/client'

export const canViewBookingList: AbilityName = 'canViewBookingList'
export const canCreateBooking: AbilityName = 'canCreateBooking'
export const canDeleteBooking: AbilityName = 'canDeleteBooking'
export const canApproveMakerStudioBooking: AbilityName =
  'canApproveMakerStudioBooking'
export const canRejectMakerStudioBooking: AbilityName =
  'canRejectMakerStudioBooking'
export const canExportBooking: AbilityName = 'canExportBooking'

export const canViewBookingListAbility: Omit<Ability, 'createdAt'> = {
  id: 8,
  name: canViewBookingList,
  description: 'Can view booking list',
}

export const canCreateBookingAbility: Omit<Ability, 'createdAt'> = {
  id: 9,
  name: canCreateBooking,
  description: 'Can create booking',
}

export const canDeleteBookingAbility: Omit<Ability, 'createdAt'> = {
  id: 10,
  name: canDeleteBooking,
  description: 'Can delete booking',
}

export const canApproveMakerStudioBookingAbility: Omit<Ability, 'createdAt'> = {
  id: 11,
  name: canApproveMakerStudioBooking,
  description: 'Can approve maker studio booking',
}

export const canRejectMakerStudioBookingAbility: Omit<Ability, 'createdAt'> = {
  id: 12,
  name: canRejectMakerStudioBooking,
  description: 'Can reject maker studio booking',
}

export const canExportBookingAbility: Omit<Ability, 'createdAt'> = {
  id: 13,
  name: canExportBooking,
  description: 'Can export booking',
}

export const AllBookingAbilities: Omit<Ability, 'createdAt'>[] = [
  canViewBookingListAbility,
  canCreateBookingAbility,
  canDeleteBookingAbility,
  canApproveMakerStudioBookingAbility,
  canRejectMakerStudioBookingAbility,
  canExportBookingAbility,
]
