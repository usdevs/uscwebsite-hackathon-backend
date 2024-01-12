import { Policy } from '@/interfaces/policy.interface'

export class Allow implements Policy {
  public Validate = async (): Promise<Decision> => 'allow'
  public Reason = () => 'Allowed.'
}
