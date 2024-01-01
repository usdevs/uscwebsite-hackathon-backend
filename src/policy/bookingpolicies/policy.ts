import * as Policies from '../commonpolicies'
import * as Abilities from '../abilities'
import { OrganisationHead } from '../role'
import { BookingPayload } from '@/services/bookings'
import {
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
  return new Policies.All(
    new Policies.BelongToOrg(booking.userOrgId),
    new AllowIfBookingIsNotTooLong(booking),
    new AllowIfBookingIsNotTooShort(booking),
    new AllowIfBookingWithin14Days(booking),
    new AllowIfBookingIsNotStacked(booking),
    new Policies.Any(
      new Policies.HasAnyAbilities(Abilities.canCreateBooking),
      new Policies.All(
        new Policies.HasRole(OrganisationHead),
        new AllowIfBookingLessThanTwoHours(booking)
      )
    )
  )
}

export const deleteBookingPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canDeleteBooking)
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
