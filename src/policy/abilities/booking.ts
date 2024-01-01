import { Ability } from '@prisma/client'

export const canViewBookingList: AbilityName = 'canViewBookingList'
export const canCreateBooking: AbilityName = 'canCreateBooking'
export const canDeleteBooking: AbilityName = 'canDeleteBooking'
export const canUpdateBooking: AbilityName = 'canUpdateBooking'
export const canApproveMakerStudioBooking: AbilityName =
  'canApproveMakerStudioBooking'
export const canRejectMakerStudioBooking: AbilityName =
  'canRejectMakerStudioBooking'
export const canExportBooking: AbilityName = 'canExportBooking'

export const canViewBookingListAbility: Create<Ability> = {
  name: canViewBookingList,
  description: 'Can view booking list',
}

export const canCreateBookingAbility: Create<Ability> = {
  name: canCreateBooking,
  description: 'Can create booking',
}

export const canDeleteBookingAbility: Create<Ability> = {
  name: canDeleteBooking,
  description: 'Can delete booking',
}

export const canUpdateBookingAbility: Create<Ability> = {
  name: canUpdateBooking,
  description: 'Can update booking',
}

export const canApproveMakerStudioBookingAbility: Create<Ability> = {
  name: canApproveMakerStudioBooking,
  description: 'Can approve maker studio booking',
}

export const canRejectMakerStudioBookingAbility: Create<Ability> = {
  name: canRejectMakerStudioBooking,
  description: 'Can reject maker studio booking',
}

export const canExportBookingAbility: Create<Ability> = {
  name: canExportBooking,
  description: 'Can export booking',
}

export const AllBookingAbilities: Create<Ability>[] = [
  canViewBookingListAbility,
  canCreateBookingAbility,
  canDeleteBookingAbility,
  canUpdateBookingAbility,
  canApproveMakerStudioBookingAbility,
  canRejectMakerStudioBookingAbility,
  canExportBookingAbility,
]
