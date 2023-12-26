import { Policy } from '@/interfaces/policy.interface'
import * as Policies from '../commonpolicies'
import * as Abilitis from '../abilities'
import { AllowIfBookingLessThanTwoHours } from './two-hour'

export const viewBookingPolicy = () => {
  return new Policies.Allow()
}

export const createBookingPolicy = (start: Date, end: Date) => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canCreateBooking),
    new Policies.All(
      new Policies.AllowIfRoleIs('OrganisationHead'),
      new AllowIfBookingLessThanTwoHours(start, end)
    )
  )
}

export const deleteBookingPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canDeleteBooking)
  )
}

export const createBookingRequestForMakerStudioPolicy = () => {
  return new Policies.Allow()
}

export const approveMakerStudioRequestPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canApproveMakerStudioBooking)
  )
}

export const rejectMakerStudioRequestPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canRejectMakerStudioBooking)
  )
}

export const exportBookingPolicy = () => {
  return new Policies.Any(
    new Policies.HasAnyAbilities(Abilitis.canExportBooking)
  )
}
