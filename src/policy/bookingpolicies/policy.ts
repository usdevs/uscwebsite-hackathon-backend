import * as Policies from '../commonpolicies'
import * as Abilities from '../abilities'
import { OrganisationHead } from '../roles'
import { BookingPayload } from '@/services/bookings'
import { User } from '@prisma/client'
import {
  AllowIfBookingBelongToUser,
  AllowIfBookingIsNotStacked,
  AllowIfBookingIsNotTooLong,
  AllowIfBookingIsNotTooShort,
  AllowIfBookingLessThanTwoHours,
  AllowIfBookingWithin14Days,
} from '.'

export const viewBookingPolicy = () => {
  return new Policies.Allow()
}

export const createBookingPolicy = (booking: BookingPayload) => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canCreateBooking),
    new Policies.All(
      new Policies.HasRole(OrganisationHead),
      new Policies.BelongToOrg(booking.userOrgId),
      new AllowIfBookingIsNotTooLong(booking),
      new AllowIfBookingIsNotTooShort(booking),
      new AllowIfBookingWithin14Days(booking),
      new AllowIfBookingIsNotStacked(booking),
      new AllowIfBookingLessThanTwoHours(booking)
    )
  )
}

export const deleteBookingPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canDeleteBooking)
  )
}

export const updateBookingPolicy = (booking: BookingPayload, user: User) => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canUpdateBooking),
    new Policies.All(
      new Policies.BelongToOrg(booking.userOrgId),
      new AllowIfBookingBelongToUser(booking, user),
      new AllowIfBookingIsNotTooLong(booking),
      new AllowIfBookingIsNotTooShort(booking),
      new AllowIfBookingWithin14Days(booking),
      new AllowIfBookingIsNotStacked(booking),
      new AllowIfBookingLessThanTwoHours(booking)
    )
  )
}

export const createBookingRequestForMakerStudioPolicy = () => {
  return new Policies.Allow()
}

export const approveMakerStudioRequestPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canApproveMakerStudioBooking)
  )
}

export const rejectMakerStudioRequestPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canRejectMakerStudioBooking)
  )
}

export const exportBookingPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canExportBooking)
  )
}
