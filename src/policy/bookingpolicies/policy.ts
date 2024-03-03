import { AllowIfAdminForVenue } from './venue-admin'
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
    new AllowIfAdminForVenue(booking),
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

/**
 * Creates a policy to delete a booking.
 * Bookings can only be deleted by the user who created them or by an admin.
 *
 * @param booking {@link BookingPayload}
 * @param user {@link User}
 */
export const deleteBookingPolicy = (booking: BookingPayload, user: User) => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canDeleteBooking),
    new AllowIfAdminForVenue(booking),
    new Policies.All(
      new Policies.BelongToOrg(booking.userOrgId),
      new AllowIfBookingBelongToUser(booking, user)
    )
  )
}

export const updateBookingPolicy = (booking: BookingPayload, user: User) => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canUpdateBooking),
    new AllowIfAdminForVenue(booking),
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

export const createBookingRequestPolicy = () => {
  return new Policies.Allow()
}

export const approveBookingRequestPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canApproveBooking)
  )
}

export const rejectBookingRequestPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canRejectBooking)
  )
}

export const exportBookingPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canExportBooking)
  )
}
