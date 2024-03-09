import { Policy } from '@/interfaces/policy.interface'

export class Deny implements Policy {
  public Validate = async (): Promise<Decision> => 'deny'
  public Reason = () => 'Denied. Only admin is allowed to perform this action.'
}
