import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import { HttpCode, HttpException } from '../../exceptions/HttpException'
import { getUserAbilities } from '../../services/users'
import { deleteOrg } from '../../services/organisations'
import { deleteOrganisation } from './delete'
import {
  generateRandomAbility,
  generateRandomOrganisation,
  generateRandomUser,
} from '../../services/test/utils'
import { UnauthorizedException } from '../../exceptions'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

jest.mock('../../services/organisations', () => ({
  deleteOrg: jest.fn(),
}))

describe('Delete Organisation controller', () => {
  const userMember = generateRandomUser({ id: 1 })
  const orgToDeleteStringId = '1'
  const orgToDeleteId = 1
  const orgToDelete = generateRandomOrganisation({ id: orgToDeleteId })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return 400 bad request if org id is not a number', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: 'hello' },
      user: userMember,
    })

    try {
      await deleteOrganisation(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Org id not found/)
    }
  })

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: orgToDeleteStringId },
    })

    try {
      await deleteOrganisation(req, res)
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
      params: { id: orgToDeleteStringId },
      user: userMember,
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])

    try {
      await deleteOrganisation(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException)
      const exception = e as UnauthorizedException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/You are not authorized to/)
    }
  })

  test('Should return 200 and delete the organisation if user is an admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: orgToDeleteStringId },
      user: userMember,
    })

    jest
      .mocked(getUserAbilities)
      .mockResolvedValue([generateRandomAbility(Policy.canManageAllAbility)])
    jest.mocked(deleteOrg).mockResolvedValue(orgToDelete)

    await deleteOrganisation(req, res)

    expect(deleteOrg).toBeCalledWith(orgToDeleteId)
    expect(res.status).toBeCalledWith(200)
    expect(res.json).toBeCalledWith(orgToDelete)
  })
})
