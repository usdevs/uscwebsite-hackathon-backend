import { User } from '@prisma/client'
import { UnauthorizedException } from '@/exceptions/HttpException'

export type Decision = 'allow' | 'deny' | '2fa'

export interface Policy {
  /**
   * Validate whether is authorized to perform an action
   * @param u the user to validate
   * @returns 'allow' if the user is authorized, 'deny' if not, '2fa' if 2fa is required
   * @throws {UnauthorizedException} if the user is not authorized
   */
  Validate: (u?: User) => Promise<Decision>
  /**
   * @returns the reason why the user is not authorized
   */
  Reason: () => string
}
