import Policy, { RolesAbilities } from '../../policy'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'
import { getUserAbilities } from '../../services/users'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

describe('User Policies', () => {
  const mockUser = generateRandomUser({ id: 1 })

  const allowDecision = 'allow'
  const denyDecision = 'deny'

  const listUser = Policy.listUserPolicy()
  const createUser = Policy.createUserPolicy()
  const updateUser = Policy.updateUserPolicy()
  const deleteUser = Policy.deleteUserPolicy()

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

    test('Should be allowed to view users', async () => {
      const res = await listUser.Validate()
      expect(res).toBe(allowDecision)
    })

    test('Should not be allowed to create users', async () => {
      const res = await createUser.Validate()
      expect(res).toBe(denyDecision)
    })

    test('Should not be allowed to update users', async () => {
      const res = await updateUser.Validate()
      expect(res).toBe(denyDecision)
    })

    test('Should not be allowed to update users', async () => {
      const res = await deleteUser.Validate()
      expect(res).toBe(denyDecision)
    })
  })
})
