import { Decision, Policy } from '@/interfaces/policy.interface'
import { User } from '@prisma/client'

export class HasAnyAbilities implements Policy {
  private abilities: string[]
  private reason: string = ''

  constructor(...abilities: string[]) {
    this.abilities = abilities
  }

  public Validate = (u?: User): Decision => {
    // for (const ability of this.abilities) {
    //   if (u.abilities.includes(ability)) {
    //     return 'allow'
    //   }
    // }
    return 'deny'
  }

  public Reason = () => this.reason
}
