import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import { HttpCode, HttpException } from '../../exceptions/HttpException'
import { destroyUser, getUserAbilities } from '../../services/users'
import { deleteUser } from './delete'
import {
  generateRandomAbility,
  generateRandomUser,
} from '../../services/test/utils'
import { UnauthorizedException } from '../../exceptions'

jest.mock('../../services/users', () => ({
  destroyUser: jest.fn(),
  getUserAbilities: jest.fn(),
  getUserRoles: jest.fn(),
  getUserOrgs: jest.fn(),
}))

describe('Delete User controller', () => {
  const userMember = generateRandomUser({ id: 1 })
  const userToDeleteStringId = '2'

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return 400 bad request if user id is not a number', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: 'hello' },
      user: userMember,
    })

    try {
      await deleteUser(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/User id not found/)
    }
  })

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: userToDeleteStringId },
    })

    try {
      await deleteUser(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/Requires authentication/)
    }
  })

  test('Should return 400 bad request if delete self', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: userMember.id.toString() },
      user: userMember,
    })

    try {
      await deleteUser(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Cannot delete self/)
    }
  })

  test('Should return 401 not authorized if user is not an admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: userToDeleteStringId },
      user: userMember,
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])

    try {
      await deleteUser(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException)
      const exception = e as UnauthorizedException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/You are not authorized to/)
    }
  })

  test('Should return 200 and the deleted user', async () => {
    const userToDeleteId = parseInt(userToDeleteStringId)
    const mockDeletedUser = generateRandomUser({
      id: userToDeleteId,
    })
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: userToDeleteStringId },
      user: userMember,
    })

    jest
      .mocked(getUserAbilities)
      .mockResolvedValue([generateRandomAbility(Policy.canManageAllAbility)])
    jest.mocked(destroyUser).mockResolvedValue(mockDeletedUser)

    await deleteUser(req, res)

    expect(destroyUser).toHaveBeenCalledWith(userToDeleteId)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(mockDeletedUser)
  })
})
