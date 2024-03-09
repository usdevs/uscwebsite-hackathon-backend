import Policy, { RolesAbilities } from '../../policy'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'
import { getUserAbilities } from '../../services/users'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

describe('Venue Policies', () => {
  const mockUser = generateRandomUser({ id: 1 })

  const allowDecision = 'allow'
  const denyDecision = 'deny'

  const listVenues = Policy.listVenuePolicy()

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Member', () => {
    const memberAbilites = RolesAbilities['member'].map((name) =>
      generateRandomAbility({ name: name })
    )

    beforeEach(() => {
      jest.mocked(getUserAbilities).mockResolvedValue(memberAbilites)
    })

    test('Should be allowed to view venues', async () => {
      const res = await listVenues.Validate()
      expect(res).toBe(allowDecision)
    })
  })
})
