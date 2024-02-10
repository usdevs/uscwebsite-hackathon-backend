import * as Policy from '../../policy'
import { BelongToOrg } from './belongToOrg'
import { getUserOrgs } from '../../services/users'
import {
  generateRandomUser,
  generateRandomOrganisation,
} from '../../services/test/utils'

jest.mock('@/services/users', () => ({
  getUserOrgs: jest.fn(),
}))

describe('BelongToOrg Policy', () => {
  const mockUser = generateRandomUser({ id: 1 })
  const mockOrg = generateRandomOrganisation({ id: 1 })
  const orgId = mockOrg.id

  // Reset the mock before each test to ensure isolation
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('should deny if user is not logged in', async () => {
    const policy = new BelongToOrg(orgId)
    const result = await policy.Validate()

    expect(result).toEqual('deny')
    expect(policy.Reason()).toEqual('User is not logged in')
  })

  test('should allow if user belongs to the specified organization', async () => {
    jest.mocked(getUserOrgs).mockResolvedValue([mockOrg])

    const policy = new BelongToOrg(orgId)
    const result = await policy.Validate(mockUser)

    expect(result).toEqual('allow')
    expect(policy.Reason()).toEqual('')
  })

  test('should deny if user does not belong to the specified organization', async () => {
    jest
      .mocked(getUserOrgs)
      .mockResolvedValue([generateRandomOrganisation({ id: 2 })])

    const policy = new BelongToOrg(orgId)
    const result = await policy.Validate(mockUser)

    expect(result).toEqual('deny')
    expect(policy.Reason()).toContain(
      `User does not belong to org id - ${orgId}`
    )
  })
})
