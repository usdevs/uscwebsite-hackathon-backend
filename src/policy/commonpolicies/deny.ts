import { Decision, Policy } from '@/interfaces/policy.interface'
import { User } from '@prisma/client'

export class Deny implements Policy {
  public Validate = async (): Promise<Decision> => 'deny'
  public Reason = () => 'Denied.'
}
