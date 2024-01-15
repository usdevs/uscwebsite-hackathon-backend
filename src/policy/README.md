# Policy Module Documentation

## Overview

The Policy Module is designed to authorize user actions within the application. It should be integrated at the controller level to ensure security and proper access control. It is an abrastraction layer over RBAC but can be extended to support additional authorization logic. The RBAC implementation is based on roles and abilities. Each ability is a single action that can be performed by a user. Each role is a collection of abilities. A user can have multiple roles. A user is authorized to perform an action if they have a role that has the ability to perform that action or passes other custom policies. Refer to the `Composable Policies` section for more information on creating policies.

## Usage Guidelines

- **Integration Point**: The `Policy.Authorize` method must be invoked as soon as all necessary information for authorization is available. This typically occurs at the beginning of a request lifecycle, but in cases where request parsing is required to retrieve parameters, it should be called immediately afterward.
  Example:

```typescript
export async function createBooking(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const booking = BookingSchema.parse(req.body)

  await Policy.Authorize(
    createBookingAction,
    Policy.createBookingPolicy(booking),
    req.user
  )

  // ... function implementation
}
```

- **Method Documentation**: For detailed information on each method, refer to `src/policy/policy.ts`.

## Core Interfaces and Functions

### Policy Interface and Types

Defines the structure for creating new policy objects. AbilityName is a type alias for a string. Please import the AbilityName from `@/policy/abilities` as all abilities are defined there and are used to seed the database. Similarly for RoleName, please import from `@/policy/roles`.

```typescript
type AbilityName = string
type RoleName = string
type Decision = 'allow' | 'deny' | '2fa'

interface Policy {
  /**
   * Determines if the user is authorized for an action.
   * @param u The user to validate.
   * @returns 'allow' if authorized, 'deny' if not, '2fa' if two-factor authentication is required.
   * @throws {UnauthorizedException} if the user is unauthorized.
   */
  Validate: (u?: User) => Promise<Decision>

  /**
   * Provides the reason for authorization denial.
   * @returns A string explaining why the user is not authorized.
   */
  Reason: () => string
}
```

### Authorize Function

Authorizes a user to perform a specified action based on provided policies.

```typescript
/**
 * Authorizes a user action.
 * @param action The action to authorize.
 * @param p The policy to use for authorization.
 * @param u The user to authorize.
 * @throws {UnauthorizedException} if the user is unauthorized.
 */
const Authorize = async (
  action: string,
  p: Policy,
  u?: User
): Promise<void> => {
  // ... function implementation
}
```

## Composable Policies

Allows the combination of multiple policies for more advanced logic.

- Any, All, HasAllAbilities, HasAnyAbilities, HasRole, BelongToOrg

Example:

```typescript
const createBookingPolicy = (booking: BookingPayload) => {
  // Allow if either of the following policies passes:
  return new Policies.Any(
    // If the user has the ability to create a booking
    new Policies.HasAnyAbilities(Abilities.canCreateBooking),
    // If the user
    new Policies.All(
      // 1. Has the organisation head role
      new Policies.HasRole(OrganisationHead),
      // 2. And belongs to the organisation of the booking
      new Policies.BelongToOrg(booking.userOrgId),
      // 3. And the booking is not too long
      new AllowIfBookingIsNotTooLong(booking),
      // 4. And the booking is not too short
      new AllowIfBookingIsNotTooShort(booking),
      // 5. And the booking is not within 14 days
      new AllowIfBookingWithin14Days(booking),
      // 6. And the booking is not stacked
      new AllowIfBookingIsNotStacked(booking),
      // 7. And the booking is less than 2 hours
      new AllowIfBookingLessThanTwoHours(booking)
    )
  )
}
```

### Allow Policy

Allows all actions, regardless of login status and role.

```typescript
class Allow implements Policy {
  /**
   * Creates a new Allow policy.
   */
  constructor() {}
  // ... class implementation
}
```

### Deny Policy

Denies all actions, unless the user is admin (has the `WebsiteAdminRole` role).

```typescript
class Deny implements Policy {
  /**
   * Creates a new Deny policy.
   */
  constructor() {}
  // ... class implementation
}
```

### All Policy

Ensures that all provided policies must pass for authorization.

```typescript
class All implements Policy {
  /**
   * Creates a new All policy.
   * @param policies The policies to combine.
   */
  constructor(...policies: Policy[]) {}
  // ... class implementation
}
```

### Any Policy

Ensures that at last one of provided policies must pass for authorization.

```typescript
class Any implements Policy {
  /**
   * Creates a new Any policy.
   * @param policies The policies to combine.
   */
  constructor(...policies: Policy[]) {}
  // ... class implementation
}
```

### HasAllAbilities Policy

Ensures that the user has all of the provided abilities.

```typescript
class HasAllAbilities implements Policy {
  /**
   * Creates a new HasAllAbilities policy.
   * @param abilities The abilities to check.
   */
  constructor(...abilities: AbilityName[]) {}
  // ... class implementation
}
```

### HasAnyAbilities Policy

Ensures that the user has at least one of the provided abilities.

```typescript
class HasAnyAbilities implements Policy {
  /**
   * Creates a new HasAnyAbilities policy.
   * @param abilities The abilities to check.
   */
  constructor(...abilities: AbilityName[]) {}
  // ... class implementation
}
```

### HasRole Policy

Ensures that the user has the provided role.

```typescript
class HasRole implements Policy {
  /**
   * Creates a new HasRole policy.
   * @param role The role to check.
   */
  constructor(role: RoleName) {}
  // ... class implementation
}
```

### BelongToOrg Policy

Ensures that the user belongs to the provided organisation.

```typescript
class BelongToOrg implements Policy {
  /**
   * Creates a new BelongToOrg policy.
   * @param orgId The organisation ID to check.
   */
  constructor(orgId: string) {}
  // ... class implementation
}
```

### Module-Specific Policies

Defines policies with specific checks for different modules.

#### Example: AllowIfBookingLessThanTwoHours

Authorizes actions based on the booking duration.

```typescript
class AllowIfBookingLessThanTwoHours implements Policy {
  /**
   * Creates a new AllowIfBookingLessThanTwoHours policy.
   * @param booking The booking to check.
   */
  constructor(booking: BookingPayload) {}
  // ... class implementation
}
```

## Roles and Abilities Seeding

1. Add the ability names and abilities to `@/policy/abilities/<module_name>.ts`.
2. Add export all the abilities in `@/policy/abilities/util.ts`. This is used to seed the database and used in the `HasAllAbilities` and `HasAnyAbilities` policies.
3. Add the role names and roles to `@/policy/roles/<module_name>.ts`.
4. Add export all the roles in `@/policy/roles/util.ts`. This is used to seed the database and used in the `HasRole`.
5. Link the abilities and roles to the `@/policy/rolesabilities/util.ts` file. This is used to seed the database.
6. To link roles to org, make the changes in `IG_Database.xlsx`
7. Run `npm run prisma:reset` to reset and seed the database.

## Creating Policies

- **Common Policies**: Utilize `policy.all` or `policy.Any` for combining multiple policies.
- **Advanced Use Cases**: For more complex scenarios, custom policies can be created following the `Policy` interface pattern.
