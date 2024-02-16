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

  const viewAdminList = Policy.viewAdminListPolicy()
  const viewOrganisationList = Policy.viewOrganisationListPolicy()
  const viewOrganisationCategory = Policy.viewOrganisationCategoryPolicy()
  const createAdmin = Policy.createAdminPolicy()
  const deleteAdmin = Policy.deleteAdminPolicy()

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

    test('Should not be allowed to view admin', async () => {
      const res = await viewAdminList.Validate()
      expect(res).toBe(denyDecision)
    })

    test('Should be allowed to view organisations list', async () => {
      const res = await viewOrganisationList.Validate()
      expect(res).toBe(allowDecision)
    })

    test('Should be allowed to view organisations category', async () => {
      const res = await viewOrganisationCategory.Validate()
      expect(res).toBe(allowDecision)
    })

    test('Should not be allowed to create admins', async () => {
      const res = await createAdmin.Validate()
      expect(res).toBe(denyDecision)
    })

    test('Should not be allowed to delete admins', async () => {
      const res = await deleteAdmin.Validate()
      expect(res).toBe(denyDecision)
    })
  })
})
