import { Ability } from '@prisma/client'

export const ToAbilitiesMap = (abilities: Ability[]) => {
  const map = new Map<string, boolean>()
  for (const ability of abilities) {
    map.set(ability.name, true)
  }
  return map
}
