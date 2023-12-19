import { Decision, Policy } from '@/interfaces/policy.interface'
import { User } from '@prisma/client'

export class Allow implements Policy {
  public Validate = (): Decision => 'allow'
  public Reason = () => 'Allowed.'
}
