import { Ability } from '@prisma/client'

export const canViewBookingList: AbilityName = 'canViewBookingList'
export const canCreateBooking: AbilityName = 'canCreateBooking'
export const canDeleteBooking: AbilityName = 'canDeleteBooking'
export const canUpdateBooking: AbilityName = 'canUpdateBooking'
export const canApproveBooking: AbilityName = 'canApproveBooking'
export const canRejectBooking: AbilityName = 'canRejectBooking'
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

export const canApproveBookingAbility: Create<Ability> = {
  name: canApproveBooking,
  description: 'Can approve maker studio booking',
}

export const canRejectBookingAbility: Create<Ability> = {
  name: canRejectBooking,
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
  canApproveBookingAbility,
  canRejectBookingAbility,
  canExportBookingAbility,
]
