import { Policy } from '@/interfaces/policy.interface'
import { getUserAbilities } from '@/services/users'
import { User } from '@prisma/client'
import { ToAbilitiesMap } from './util'

export class HasAllAbilities implements Policy {
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
      if (!abilitiesMap.get(ability)) {
        this.reason = `User does not have the ability: ${ability}.`
        return 'deny'
      }
    }

    return 'allow'
  }

  public Reason = () => this.reason
}
