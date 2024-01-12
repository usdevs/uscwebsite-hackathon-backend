import { Policy } from '@/interfaces/policy.interface'
import { getUserAbilities } from '@/services/users'
import { User } from '@prisma/client'
import { ToAbilitiesMap } from './util'

export class HasAnyAbilities implements Policy {
  private abilities: AbilityName[]
  private reason: string = ''

  constructor(...abilities: AbilityName[]) {
    this.abilities = abilities
  }

  public Validate = async (u?: User): Promise<Decision> => {
    if (!u) {
      this.reason = 'User is not logged in'
      return 'deny'
    }

    const abilities = await getUserAbilities(u.id)
    const abilitiesMap = ToAbilitiesMap(abilities)

    for (const ability of this.abilities) {
      if (abilitiesMap.get(ability)) {
        return 'allow'
      }
    }

    this.reason = `User does not have any of the abilities: ${this.abilities.join(
      ', '
    )}.`

    return 'deny'
  }

  public Reason = () => this.reason
}
