import { User } from '@prisma/client'
import { Policy } from '@/interfaces/policy.interface'
import { UnauthorizedException } from '@/exceptions'
import { getUserAbilities } from '@/services/users'
import { canManageAll } from './abilities'

/**
 * Authorize a user to perform an action
 * @param action the action to authorize, purely used for returning a more informative error message
 * @param p the policy to use
 * @param u the user to authorize
 * @throws {UnauthorizedException} if the user is not authorized
 */
export const Authorize = async (
  action: string,
  p: Policy,
  u?: User
): Promise<void> => {
  if (u) {
    const abilities = await getUserAbilities(u.id)
    const isAdmin = abilities.some((a) => a.name === canManageAll)
    if (isAdmin) return // admin can do anything
  }

  const decision = await p.Validate(u)
  switch (decision) {
    case 'allow':
      return
    case 'deny':
      throw new UnauthorizedException(
        `You are not authorized to ${action}. ${p.Reason()}`
      )
    case '2fa': // there is no policy that returns '2fa' yet
      throw new UnauthorizedException('2fa required')
  }
}
