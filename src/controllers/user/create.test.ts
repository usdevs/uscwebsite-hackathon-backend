import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import { HttpCode, HttpException } from '../../exceptions/HttpException'
import { addUser, getUserAbilities } from '../../services/users'
import { createUser } from './create'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'
import { UnauthorizedException } from '../../exceptions'

jest.mock('../../services/users', () => ({
  addUser: jest.fn(),
  getUserAbilities: jest.fn(),
  getUserRoles: jest.fn(),
  getUserOrgs: jest.fn(),
}))

describe('Create User controller', () => {
  const userMember = generateRandomUser({ id: 1 })
  const mockNewUser = {
    name: 'test',
    telegramUserName: 'test',
    telegramId: 'test',
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>()

    try {
      await createUser(req, res)
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
      body: mockNewUser,
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])

    try {
      await createUser(req, res)
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
      })

      try {
        await createUser(req, res)
        throw new Error('Test failed')
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException)
        const exception = e as UnauthorizedException
        expect(exception.status).toBe(HttpCode.Unauthorized)
        expect(exception.message).toMatch(/Invalid new user data/)
        expect(getUserAbilities).not.toHaveBeenCalled()
      }
    })

    test('Should return 200 if data is valid', async () => {
      const insertedUser = generateRandomUser(mockNewUser)

      const { res } = getMockRes()
      const req = getMockReq<RequestWithUser>({
        user: userMember,
        body: mockNewUser,
      })

      jest
        .mocked(getUserAbilities)
        .mockResolvedValue([generateRandomAbility(Policy.canManageAllAbility)])
      jest.mocked(addUser).mockResolvedValue(insertedUser)

      await createUser(req, res)

      expect(addUser).toHaveBeenCalledWith(mockNewUser)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ result: [insertedUser] })
    })
  })
})
