import Policy, { RolesAbilities } from '../../policy'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'
import { getUserAbilities } from '../../services/users'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

describe('Submission Policies', () => {
  const mockUser = generateRandomUser({ id: 1 })

  const allowDecision = 'allow'
  const denyDecision = 'deny'

  const viewSubmission = Policy.viewSubmissionPolicy()
  const createSubmission = Policy.createSubmissionPolicy()
  const updateSubmission = Policy.updateSubmissionPolicy()
  const publishSubmission = Policy.publishSubmissionPolicy()
  const deleteSubmission = Policy.deleteSubmissionPolicy()

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

    test('Should be allowed to view submission', async () => {
      const res = await viewSubmission.Validate(mockUser)
      expect(res).toBe(allowDecision)
    })

    test('Should not be allowed to create submission', async () => {
      const res = await createSubmission.Validate(mockUser)
      expect(res).toBe(denyDecision)
    })

    test('Should not be allowed to update submission', async () => {
      const res = await updateSubmission.Validate(mockUser)
      expect(res).toBe(denyDecision)
    })

    test('Should not be allowed to publish submission', async () => {
      const res = await publishSubmission.Validate(mockUser)
      expect(res).toBe(denyDecision)
    })

    test('Should not be allowed to delete submission', async () => {
      const res = await deleteSubmission.Validate(mockUser)
      expect(res).toBe(denyDecision)
    })
  })

  describe('AcadsAdmin', () => {
    const acadsAdminAbilities = RolesAbilities['acads_admin'].map((name) =>
      generateRandomAbility({ name })
    )

    beforeEach(() => {
      jest.mocked(getUserAbilities).mockResolvedValue(acadsAdminAbilities)
    })

    test('Should be allowed to view submission', async () => {
      const res = await viewSubmission.Validate(mockUser)
      expect(res).toBe(allowDecision)
    })

    test('Should be allowed to create submission', async () => {
      const res = await createSubmission.Validate(mockUser)
      expect(res).toBe(allowDecision)
    })

    test('Should be allowed to update submission', async () => {
      const res = await updateSubmission.Validate(mockUser)
      expect(res).toBe(allowDecision)
    })

    test('Should be allowed to publish submission', async () => {
      const res = await publishSubmission.Validate(mockUser)
      expect(res).toBe(allowDecision)
    })

    test('Should be allowed to delete submission', async () => {
      const res = await deleteSubmission.Validate(mockUser)
      expect(res).toBe(allowDecision)
    })
  })
})
