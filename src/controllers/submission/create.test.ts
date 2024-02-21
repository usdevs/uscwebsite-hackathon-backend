import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import {
  HttpCode,
  HttpException,
  UnauthorizedException,
} from '../../exceptions/'
import { getUserAbilities } from '../../services/users'
import {
  generateRandomAbility,
  generateRandomCourseOfferingUniqueInput,
  generateRandomDetailedSubmission,
  generateRandomStudent,
  generateRandomUser,
} from '../../services/test/utils'
import { createSubmission } from './create'
import { SubmissionPayload, addSubmission } from '../../services/submissions'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
}))

jest.mock('../../services/submissions', () => ({
  addSubmission: jest.fn(),
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('Create Submission controller', () => {
  const userMember = generateRandomUser({ id: 1 })
  const submission = generateRandomDetailedSubmission({ id: 1 })
  const courseOfferingInput = generateRandomCourseOfferingUniqueInput()
  const student = generateRandomStudent()

  const submissionPayload: SubmissionPayload = {
    title: submission.title,
    text: submission.text,
    matriculationNo: student.matriculationNo,
    courseOfferingInput,
  }

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: submissionPayload,
    })

    try {
      await createSubmission(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/Requires authentication/)
    }
  })

  test('Should return 403 forbidden if user is not authorized', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: submissionPayload,
      user: userMember,
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])

    try {
      await createSubmission(req, res)
      throw new Error('Test failed')
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException)
      expect(e).toBeInstanceOf(UnauthorizedException)
      const exception = e as UnauthorizedException
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/You are not authorized to/)
    }
  })

  test('Should return 200 and the created submission if user is acads admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: submissionPayload,
      user: userMember,
    })

    const acadsAdminAbilities = Policy.RolesAbilities['acads_admin'].map(
      (name) => generateRandomAbility({ name })
    )
    jest.mocked(getUserAbilities).mockResolvedValue(acadsAdminAbilities)
    jest.mocked(addSubmission).mockResolvedValue(submission)

    await createSubmission(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ result: [submission] })
  })

  test('Should return 200 and the created submission if user is admin', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: submissionPayload,
      user: userMember,
    })

    const adminAbilities = Policy.RolesAbilities['website_admin'].map((name) =>
      generateRandomAbility({ name })
    )
    jest.mocked(getUserAbilities).mockResolvedValue(adminAbilities)
    jest.mocked(addSubmission).mockResolvedValue(submission)

    await createSubmission(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ result: [submission] })
  })
})
