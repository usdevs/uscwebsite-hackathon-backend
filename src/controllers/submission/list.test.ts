import { getMockReq, getMockRes } from '@jest-mock/express'
import { Request } from 'express'
import { generateRandomDetailedSubmission } from '../../services/test/utils'
import { getAllSubmissions } from '../../services/submissions'
import { listSubmissions } from './list'

jest.mock('../../services/submissions', () => ({
  getAllSubmissions: jest.fn(),
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('listSubmissions', () => {
  test('Should return all submissions', async () => {
    const { res } = getMockRes()
    const req = getMockReq<Request>()

    const mockSubmissions = [
      generateRandomDetailedSubmission(),
      generateRandomDetailedSubmission(),
    ]
    jest.mocked(getAllSubmissions).mockResolvedValue(mockSubmissions)

    await listSubmissions(req, res)
    expect(res.json).toHaveBeenCalledWith(mockSubmissions)
  })
})
