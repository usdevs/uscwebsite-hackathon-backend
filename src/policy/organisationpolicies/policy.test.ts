import Policy, { RolesAbilities } from '../../policy'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'
import { getUserAbilities } from '../../services/users'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

describe('Organisation Policies', () => {
  const mockUser = generateRandomUser({ id: 1 })

  const allowDecision = 'allow'
  const denyDecision = 'deny'

  const listOrg = Policy.listOrgsPolicy()
  const createOrg = Policy.createOrgPolicy()
  const updateOrg = Policy.updateOrgPolicy()
  const deleteOrg = Policy.deleteOrgPolicy()

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

    test('Should be allowed to view organisations', async () => {
      const res = await listOrg.Validate()
      expect(res).toBe(allowDecision)
    })

    test('Should not be allowed to create organisations', async () => {
      const res = await createOrg.Validate()
      expect(res).toBe(denyDecision)
    })

    test('Should not be allowed to update organisations', async () => {
      const res = await updateOrg.Validate()
      expect(res).toBe(denyDecision)
    })

    test('Should not be allowed to update organisations', async () => {
      const res = await deleteOrg.Validate()
      expect(res).toBe(denyDecision)
    })
  })
})
