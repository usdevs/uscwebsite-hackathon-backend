import * as Policy from '../../policy'
import { HasAnyAbilities } from '.'
import { getUserAbilities } from '../../services/users'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'

jest.mock('@/services/users', () => ({
  getUserAbilities: jest.fn(),
}))

describe('HasAnyAbilities Policy', () => {
  const mockUser = generateRandomUser({ id: 1 })
  const abilities = [
    generateRandomAbility(Policy.canUpdateBookingAbility),
    generateRandomAbility(Policy.canDeleteBookingAbility),
  ]
  const abilityNames = abilities.map((a) => a.name)

  // Reset the mock before each test to ensure isolation
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('should deny if user is not logged in', async () => {
    const policy = new HasAnyAbilities(...abilityNames)
    const result = await policy.Validate()

    expect(result).toEqual('deny')
    expect(policy.Reason()).toEqual('User is not logged in')
  })

  test('should allow if user has any ability', async () => {
    jest.mocked(getUserAbilities).mockResolvedValue([abilities[0]])

    const policy = new HasAnyAbilities(...abilityNames)
    const result = await policy.Validate(mockUser)

    expect(result).toEqual('allow')
    expect(policy.Reason()).toEqual('')
  })

  test('should deny if user has none of the abilities', async () => {
    jest.mocked(getUserAbilities).mockResolvedValue([])

    const policy = new HasAnyAbilities(...abilityNames)
    const result = await policy.Validate(mockUser)

    expect(result).toEqual('deny')
    expect(policy.Reason()).toContain('User does not have any of the abilities')
  })
})
