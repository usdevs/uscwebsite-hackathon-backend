# Policy Module Documentation

## Overview

The Policy Module is designed to authorize user actions within the application. It should be integrated at the controller level to ensure security and proper access control.

## Usage Guidelines

- **Integration Point**: The `Policy.Authorize` method must be invoked as soon as all necessary information for authorization is available. This typically occurs at the beginning of a request lifecycle, but in cases where request parsing is required to retrieve parameters, it should be called immediately afterward.
  Example:

```typescript
export async function createBooking(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const booking = BookingSchema.parse(req.body)

  await Policy.Authorize(
    createBookingAction,
    Policy.createBookingPolicy(booking.start, booking.end),
    user
  )

  // ... function implementation
}
```

- **Method Documentation**: For detailed information on each method, refer to `src/policy/policy.ts`.

## Core Interfaces and Functions

### Policy Interface

Defines the structure for creating new policy objects.

```typescript
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

- Any, All, HasAllAbilities, HasAnyAbilities, HasRole

### All Policy

Ensures that all provided policies must pass for authorization.

```typescript
class All implements Policy {
  // ... class implementation
}
```

### Any Policy

Ensures that at last one of provided policies must pass for authorization.

```typescript
class Any implements Policy {
  // ... class implementation
}
```

### Module-Specific Policies

Defines policies with specific checks for different modules.

#### Example: AllowIfBookingLessThanTwoHours

Authorizes actions based on the booking duration.

```typescript
class AllowIfBookingLessThanTwoHours implements Policy {
  // ... class implementation
}
```

## Notes

- **Common Policies**: Utilize `policy.all` or `policy.Any` for combining multiple policies.
- **Advanced Use Cases**: For more complex scenarios, custom policies can be created following the `Policy` interface pattern.
