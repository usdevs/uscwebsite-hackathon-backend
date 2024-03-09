import * as Policy from '../../policy'
import { HasAllAbilities } from '.'
import { getUserAbilities } from '../../services/users'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'

jest.mock('@/services/users', () => ({
  getUserAbilities: jest.fn(),
}))

describe('HasAllAbilities Policy', () => {
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
    const policy = new HasAllAbilities(...abilityNames)
    const result = await policy.Validate()

    expect(result).toEqual('deny')
    expect(policy.Reason()).toEqual('User is not logged in')
  })

  test('should allow if user has all abilities', async () => {
    jest.mocked(getUserAbilities).mockResolvedValue(abilities)

    const policy = new HasAllAbilities(...abilityNames)
    const result = await policy.Validate(mockUser)

    expect(result).toEqual('allow')
    expect(policy.Reason()).toEqual('')
  })

  test('should deny if user lacks one or more abilities', async () => {
    jest.mocked(getUserAbilities).mockResolvedValue([abilities[0]])

    const policy = new HasAllAbilities(...abilityNames)
    const result = await policy.Validate(mockUser)

    expect(result).toEqual('deny')
    expect(policy.Reason()).toContain('User does not have the ability')
  })
})
