import { updateOrg } from './../../services/organisations'
import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import { HttpCode, HttpException } from '../../exceptions/HttpException'
import { getUserAbilities } from '../../services/users'
import { editOrganisation } from './update'
import {
  generateRandomAbility,
  generateRandomOrganisation,
  generateRandomUser,
} from '../../services/test/utils'
import { UnauthorizedException } from '../../exceptions'
import { IGCategory } from '@prisma/client'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
  getUserRoles: jest.fn(),
  getUserOrgs: jest.fn(),
}))

jest.mock('../../services/organisations', () => ({
  updateOrg: jest.fn(),
}))

describe('Create User controller', () => {
  const userMember = generateRandomUser({ id: 1 })

  const updateOrgStringId = '2'
  const updateOrgPayload = {
    name: 'test',
    description: 'test',
    isAdminOrg: false,
    inviteLink: 'test',
    category: 'Sports' as IGCategory,
    isInactive: false,
    isInvisible: false,
    igHead: 1,
    otherMembers: [2, 3],
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return 400 Bad Request if org id is not a number', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: userMember,
      body: updateOrgPayload,
      params: { id: 'not a number' },
    })

    try {
      await editOrganisation(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Org id is not a number/)
    }
  })

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: updateOrgPayload,
      params: { id: updateOrgStringId },
    })

    try {
      await editOrganisation(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/Requires authentication/)
    }
  })

  test('Should return 401 not authorized if user is not an admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: userMember,
      body: updateOrgPayload,
      params: { id: updateOrgStringId },
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])

    try {
      await editOrganisation(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException)
      const exception = e as UnauthorizedException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/You are not authorized to/)
    }
  })

  describe('User is admin', () => {
    test('Should throw 400 Bad Request if body does not match org schema', async () => {
      const mockUpdateOrgBadData = {
        name: 'test',
        telegramId: 'test',
      }

      const { res } = getMockRes()
      const req = getMockReq<RequestWithUser>({
        user: userMember,
        body: mockUpdateOrgBadData,
        params: { id: updateOrgStringId },
      })

      try {
        await editOrganisation(req, res)
        throw new Error('Test failed')
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException)
        const exception = e as HttpException
        expect(exception.status).toBe(HttpCode.BadRequest)
        expect(exception.message).toMatch(/Invalid org data/)
        expect(getUserAbilities).not.toHaveBeenCalled()
      }
    })

    test('Should return 200 if data is valid', async () => {
      const updateOrgId = parseInt(updateOrgStringId, 10)
      const updatedOrg = generateRandomOrganisation({
        ...updateOrgPayload,
      })

      const { res } = getMockRes()
      const req = getMockReq<RequestWithUser>({
        user: userMember,
        body: updateOrgPayload,
        params: { id: updateOrgStringId },
      })

      jest
        .mocked(getUserAbilities)
        .mockResolvedValue([generateRandomAbility(Policy.canManageAllAbility)])
      jest.mocked(updateOrg).mockResolvedValue(updatedOrg)

      await editOrganisation(req, res)

      expect(updateOrg).toHaveBeenCalledWith(updateOrgId, {
        ...updateOrgPayload,
        userId: userMember.id,
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ result: [updatedOrg] })
    })
  })
})
