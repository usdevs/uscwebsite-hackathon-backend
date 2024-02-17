import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import {
  generateRandomAbility,
  generateRandomDetailedSubmission,
  generateRandomUser,
} from '../../services/test/utils'
import { deleteSubmission } from '../../services/submissions'
import { handleDeleteSubmission } from './delete'
import { HttpCode, HttpException } from '../../exceptions'
import { getUserAbilities } from '../../services/users'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

jest.mock('../../services/submissions', () => ({
  deleteSubmission: jest.fn(),
}))

describe('Delete Submission controller', () => {
  const userMember = generateRandomUser({ id: 1 })
  const submissionToDeleteStringId = '2'
  const detailedSubmission = generateRandomDetailedSubmission({ id: 2 })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return 400 bad request if submission id is not a number', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: 'hello' },
      user: userMember,
    })

    try {
      await handleDeleteSubmission(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Invalid submission id/)
    }
  })

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: submissionToDeleteStringId },
    })

    try {
      await handleDeleteSubmission(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/Requires authentication/)
    }
  })

  test('Should return 401 not authorized if user is not a Booking Admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: submissionToDeleteStringId },
      user: userMember,
    })
    const memberAbilities = Policy.RolesAbilities['member'].map((name) =>
      generateRandomAbility({ name })
    )

    jest.mocked(getUserAbilities).mockResolvedValue(memberAbilities)

    try {
      await handleDeleteSubmission(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(
        /You are not authorized to delete submission/
      )
    }
  })

  test('Should succeed if user is booking admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: submissionToDeleteStringId },
      user: userMember,
    })

    const bookingAdminAbilities = Policy.RolesAbilities['acads_admin'].map(
      (name) => generateRandomAbility({ name })
    )
    jest.mocked(getUserAbilities).mockResolvedValue(bookingAdminAbilities)
    jest.mocked(deleteSubmission).mockResolvedValue(detailedSubmission)

    await handleDeleteSubmission(req, res)
    expect(res.status).toBeCalledWith(HttpCode.OK)
    expect(res.json).toBeCalledWith(detailedSubmission)
  })

  test('Should succeed if user is admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: submissionToDeleteStringId },
      user: userMember,
    })

    const adminAbilities = Policy.RolesAbilities['website_admin'].map((name) =>
      generateRandomAbility({ name })
    )
    jest.mocked(getUserAbilities).mockResolvedValue(adminAbilities)
    jest.mocked(deleteSubmission).mockResolvedValue(detailedSubmission)

    await handleDeleteSubmission(req, res)
    expect(res.status).toBeCalledWith(HttpCode.OK)
    expect(res.json).toBeCalledWith(detailedSubmission)
  })
})
