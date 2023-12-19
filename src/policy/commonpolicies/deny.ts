import { Decision, Policy } from '@/interfaces/policy.interface'
import { User } from '@prisma/client'

export class Deny implements Policy {
  public Validate = (): Decision => 'deny'
  public Reason = () => 'Denied.'
}
