import * as Policy from '../../policy'
import { HasRole } from './hasRole'
import { getUserRoles } from '../../services/users'
import {
  generateRandomUser,
  generateRandomRole,
} from '../../services/test/utils'

jest.mock('../../services/users', () => ({
  getUserRoles: jest.fn(),
}))

describe('HasRole Policy', () => {
  const mockUser = generateRandomUser({ id: 1 })
  const mockRole = generateRandomRole(Policy.MemberRole)
  const roleName = mockRole.name

  // Reset the mock before each test to ensure isolation
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('should deny if user is not logged in', async () => {
    const policy = new HasRole(roleName)
    const result = await policy.Validate()

    expect(result).toEqual('deny')
    expect(policy.Reason()).toEqual('User is not logged in')
  })

  test('should allow if user has the specified role', async () => {
    jest.mocked(getUserRoles).mockResolvedValue([mockRole])

    const policy = new HasRole(roleName)
    const result = await policy.Validate(mockUser)

    expect(result).toEqual('allow')
    expect(policy.Reason()).toEqual('')
  })

  test('should deny if user lacks the specified role', async () => {
    jest
      .mocked(getUserRoles)
      .mockResolvedValue([generateRandomRole(Policy.SpacesAdminRole)])

    const policy = new HasRole(roleName)
    const result = await policy.Validate(mockUser)

    expect(result).toEqual('deny')
    expect(policy.Reason()).toContain(`User does not have role ${roleName}`)
  })
})
