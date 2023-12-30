import * as Policies from '../commonpolicies'
import * as Abilities from '../abilities'
import { AllowIfBookingLessThanTwoHours } from './two-hour'
import { OrganisationHead } from '../role'

export const viewBookingPolicy = () => {
  return new Policies.Allow()
}

export const createBookingPolicy = (start: Date, end: Date) => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilities.canCreateBooking),
    new Policies.All(
      new Policies.AllowIfRoleIs(OrganisationHead),
      new AllowIfBookingLessThanTwoHours(start, end)
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
