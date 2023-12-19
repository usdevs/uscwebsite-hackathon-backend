import { Decision, Policy } from '@/interfaces/policy.interface'
import { User } from '@prisma/client'

export class Any implements Policy {
  private policies: Policy[]
  private reason: string[] = []

  constructor(...policies: Policy[]) {
    this.policies = policies
  }

  public Validate = (u?: User): Decision => {
    for (const p of this.policies) {
      const decision = p.Validate(u)
      if (decision === 'allow') {
        return decision
      }

      this.reason.push(p.Reason())
    }
    return 'deny'
  }

  public Reason = () => this.reason.join(' ')
}
