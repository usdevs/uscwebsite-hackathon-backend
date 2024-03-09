import { Policy } from '@/interfaces/policy.interface'
import { getUserAbilities } from '@/services/users'
import { User } from '@prisma/client'
import { ToAbilitiesMap } from './util'

export class HasAnyAbilities implements Policy {
  private abilityNames: AbilityName[]
  private reason: string = ''

  constructor(...abilityNames: AbilityName[]) {
    this.abilityNames = abilityNames
  }

  public Validate = async (u?: User): Promise<Decision> => {
    if (!u) {
      this.reason = 'User is not logged in'
      return 'deny'
    }

    const abilities = await getUserAbilities(u.id)
    const abilitiesMap = ToAbilitiesMap(abilities)

    for (const name of this.abilityNames) {
      if (abilitiesMap.get(name)) {
        return 'allow'
      }
    }

    this.reason = `User does not have any of the abilities: ${this.abilityNames.join(
      ', '
    )}.`

    return 'deny'
  }

  public Reason = () => this.reason
}
