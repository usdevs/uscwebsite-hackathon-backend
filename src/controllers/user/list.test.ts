import { getMockReq, getMockRes } from '@jest-mock/express'
import { RequestWithUser } from '../../interfaces/auth.interface'
import { HttpCode, HttpException } from '../../exceptions/HttpException'
import { getAllUsers, getUserAbilities } from '../../services/users'
import { listUser } from './list'
import { generateRandomUser } from '../../services/test/utils'

jest.mock('../../services/users', () => ({
  getAllUsers: jest.fn(),
  getUserAbilities: jest.fn(),
  getUserRoles: jest.fn(),
  getUserOrgs: jest.fn(),
}))

describe('List User controller', () => {
  const userMember = generateRandomUser({ id: 1 })

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>()

    try {
      await listUser(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/Requires authentication/)
    }
  })

  test('Should return 200 and list of users if user is logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: userMember,
    })

    const users = [generateRandomUser({ id: 1 }), generateRandomUser({ id: 2 })]

    jest.mocked(getUserAbilities).mockResolvedValue([])
    jest.mocked(getAllUsers).mockResolvedValue(users)

    await listUser(req, res)
    expect(res.json).toBeCalledWith(users)
  })
})
