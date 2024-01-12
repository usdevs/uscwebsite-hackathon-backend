import * as Policies from '../commonpolicies'
import * as Abilities from '../abilities'

/**
 * According to existing logic, all users are allowed to view the list of users.
 */
export const listUserPolicy = () => {
  return new Policies.Allow()
}

/**
 * Strictly only admin is allowed. We deny all other users.
 */
export const createUserPolicy = () => {
  return new Policies.Deny()
}

/**
 * Strictly only admin is allowed. We deny all other users.
 */
export const updateUserPolicy = () => {
  return new Policies.Deny()
}

/**
 * Strictly only admin is allowed. We deny all other users.
 */
export const deleteUserPolicy = () => {
  return new Policies.Deny()
}
