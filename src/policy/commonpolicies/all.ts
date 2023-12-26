import { Decision, Policy } from '@/interfaces/policy.interface'
import { User } from '@prisma/client'

export class All implements Policy {
  private policies: Policy[]
  private reason: string = ''

  constructor(...policies: Policy[]) {
    this.policies = policies
  }

  public Validate = async (u?: User): Promise<Decision> => {
    for (const p of this.policies) {
      const decision = await p.Validate(u)
      if (decision === 'deny') {
        this.Reason = p.Reason
        return decision
      }
    }
    return 'allow'
  }

  public Reason = () => this.reason
}
