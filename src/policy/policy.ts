import { User } from '@prisma/client'
import { Policy } from '@/interfaces/policy.interface'
import { UnauthorizedException } from '@/exceptions/HttpException'

/**
 * Authorize a user to perform an action
 * @param u the user to authorize
 * @param action the action to authorize
 * @param p the policy to use
 * @throws {UnauthorizedException} if the user is not authorized
 */
export const Authorize = async (
  u: User,
  action: string,
  p: Policy
): Promise<void> => {
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
