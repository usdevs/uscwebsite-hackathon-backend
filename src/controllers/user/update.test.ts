import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import { HttpCode, HttpException } from '../../exceptions/HttpException'
import { getUserAbilities, updateUser } from '../../services/users'
import { editUser } from './update'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'
import { UnauthorizedException } from '../../exceptions'

jest.mock('../../services/users', () => ({
  updateUser: jest.fn(),
  getUserAbilities: jest.fn(),
  getUserRoles: jest.fn(),
  getUserOrgs: jest.fn(),
}))

describe('Create User controller', () => {
  const userMember = generateRandomUser({ id: 1 })

  const updateUserStringId = '2'
  const updateUserPayload = {
    name: 'test',
    telegramUserName: 'test',
    telegramId: 'test',
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return 400 Bad Request if user id is not a number', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: userMember,
      body: updateUserPayload,
      params: { id: 'not a number' },
    })

    try {
      await editUser(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/User id is not a number/)
    }
  })

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: updateUserPayload,
      params: { id: updateUserStringId },
    })

    try {
      await editUser(req, res)
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
      body: updateUserPayload,
      params: { id: updateUserStringId },
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])

    try {
      await editUser(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException)
      const exception = e as UnauthorizedException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/You are not authorized to/)
    }
  })

  describe('User is admin', () => {
    test('Should throw 400 Bad Request if body does not match user schema', async () => {
      const mockNewUserBadData = {
        name: 'test',
        oops: 'test',
        telegramId: 'test',
      }

      const { res } = getMockRes()
      const req = getMockReq<RequestWithUser>({
        user: userMember,
        body: mockNewUserBadData,
        params: { id: updateUserStringId },
      })

      try {
        await editUser(req, res)
        throw new Error('Test failed')
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException)
        const exception = e as HttpException
        expect(exception.status).toBe(HttpCode.BadRequest)
        expect(exception.message).toMatch(/Invalid user data/)
        expect(getUserAbilities).not.toHaveBeenCalled()
      }
    })

    test('Should return 200 if data is valid', async () => {
      const updateUserId = parseInt(updateUserStringId, 10)
      const updatedUser = generateRandomUser({
        ...updateUserPayload,
        id: updateUserId,
      })

      const { res } = getMockRes()
      const req = getMockReq<RequestWithUser>({
        user: userMember,
        body: updateUserPayload,
        params: { id: updateUserStringId },
      })

      jest
        .mocked(getUserAbilities)
        .mockResolvedValue([generateRandomAbility(Policy.canManageAllAbility)])
      jest.mocked(updateUser).mockResolvedValue(updatedUser)

      await editUser(req, res)

      expect(updateUser).toHaveBeenCalledWith(updateUserId, updateUserPayload)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ result: [updatedUser] })
    })
  })
})
