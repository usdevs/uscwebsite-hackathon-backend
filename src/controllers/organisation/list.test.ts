import { getMockReq, getMockRes } from '@jest-mock/express'
import {
  OrganisationWithIGHead,
  getAllOrgs,
} from '../../services/organisations'
import { Request } from 'express'
import { listOrgs } from './list'
import { getUserAbilities } from '../../services/users'
import {
  generateRandomOrganisation,
  generateRandomUser,
} from '../../services/test/utils'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

jest.mock('../../services/organisations', () => ({
  getAllOrgs: jest.fn(),
}))

describe('List Organisation controller', () => {
  test('Should return list of organisations', async () => {
    const { res } = getMockRes()
    const req = getMockReq<Request>({})

    // TODO: Add implementation for Organisation /w UserOnOrg and User utility
    const org = generateRandomOrganisation({ id: 1 })
    const user = generateRandomUser({ id: 1 })
    const orgWithIgHead: OrganisationWithIGHead = {
      ...org,
      userOrg: [
        {
          isIGHead: true,
          deleted: false,
          userId: user.id,
          orgId: org.id,
          assignedAt: new Date(),
          user: {
            ...user,
          },
        },
      ],
    }

    const orgs: OrganisationWithIGHead[] = [orgWithIgHead]

    jest.mocked(getAllOrgs).mockResolvedValue(orgs)
    jest.mocked(getUserAbilities).mockResolvedValue([])

    await listOrgs(req, res)
    expect(res.json).toBeCalledWith(orgs)
  })
})
