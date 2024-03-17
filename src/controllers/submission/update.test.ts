import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import { HttpCode, HttpException } from '../../exceptions/HttpException'
import { getUserAbilities } from '../../services/users'
import { updateSubmission } from '../../services/submissions'
import {
  generateRandomAbility,
  generateRandomDetailedSubmission,
  generateRandomUser,
} from '../../services/test/utils'
import { UnauthorizedException } from '../../exceptions'
import { editSubmission } from './update'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

jest.mock('../../services/submissions', () => ({
  updateSubmission: jest.fn(),
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('Update Submission controller', () => {
  const userMember = generateRandomUser({ id: 1 })
  const updateSubmissionStringId = '2'
  const updateSubmissionPayload = {
    title: 'test',
    text: 'test',
  }
  const updatedSubmission = generateRandomDetailedSubmission({ id: 2 })

  test('Should return 400 Bad Request if submission id is not a number', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: userMember,
      body: updateSubmissionPayload,
      params: { id: 'not a number' },
    })

    try {
      await editSubmission(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Submission id is not a number/)
    }
  })

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: updateSubmissionPayload,
      params: { id: updateSubmissionStringId },
    })

    try {
      await editSubmission(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/Requires authentication/)
    }
  })

  test('Should return 401 not authorized if user is not authorized', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: updateSubmissionPayload,
      user: userMember,
      params: { id: updateSubmissionStringId },
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])

    try {
      await editSubmission(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException)
      const exception = e as UnauthorizedException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/You are not authorized to/)
    }
  })

  test('Should return 200 and the updated submission if user is acads admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: updateSubmissionPayload,
      user: userMember,
      params: { id: updateSubmissionStringId },
    })

    const acadsAdminAbilities = Policy.RolesAbilities['acads_admin'].map(
      (name) => generateRandomAbility({ name })
    )
    jest.mocked(getUserAbilities).mockResolvedValue(acadsAdminAbilities)
    jest.mocked(updateSubmission).mockResolvedValue(updatedSubmission)

    await editSubmission(req, res)
    expect(updateSubmission).toHaveBeenCalledWith(
      parseInt(updateSubmissionStringId, 10),
      updateSubmissionPayload
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ result: [updatedSubmission] })
  })

  test('Should return 200 and the updated submission if user is admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: updateSubmissionPayload,
      user: userMember,
      params: { id: updateSubmissionStringId },
    })

    const adminAbilities = Policy.RolesAbilities['website_admin'].map((name) =>
      generateRandomAbility({ name })
    )
    jest.mocked(getUserAbilities).mockResolvedValue(adminAbilities)
    jest.mocked(updateSubmission).mockResolvedValue(updatedSubmission)

    await editSubmission(req, res)
    expect(updateSubmission).toHaveBeenCalledWith(
      parseInt(updateSubmissionStringId, 10),
      updateSubmissionPayload
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ result: [updatedSubmission] })
  })
})
