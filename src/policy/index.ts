import * as Policies from './policy'
import * as SubmissionPolicies from './submissionpolicies'
import * as BookingPolicies from './bookingpolicies'
import * as AdminPolicies from './adminpolicies'
import * as UserPolicies from './userpolicies'
import * as VenuePolicies from './venuepolicies'
import * as OrganisationPolicies from './organisationpolicies'

export * from './policy'
export * from './submissionpolicies'
export * from './bookingpolicies'
export * from './adminpolicies'
export * from './userpolicies'
export * from './venuepolicies'
export * from './organisationpolicies'
export * from './abilities/'
export * from './roles/'
export * from './rolesabilities'

export default {
  ...Policies,
  ...SubmissionPolicies,
  ...BookingPolicies,
  ...AdminPolicies,
  ...UserPolicies,
  ...VenuePolicies,
  ...OrganisationPolicies,
}
