import * as Policies from '../commonpolicies'

/**
 * All users, even non-members are allowed to list organisations.
 */
export const listOrgsPolicy = () => {
  return new Policies.Allow()
}

/**
 * Strictly only admin is allowed. We deny all other users.
 */
export const createOrgPolicy = () => {
  return new Policies.Deny()
}

/**
 * Strictly only admin is allowed. We deny all other users.
 * TODO: Allow IG heads to update their own organisations
 *
 */
export const updateOrgPolicy = () => {
  return new Policies.Deny()
}

/**
 * Strictly only admin is allowed. We deny all other users.
 */
export const deleteOrgPolicy = () => {
  return new Policies.Deny()
}
