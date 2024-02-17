import { prismaMock } from './test/singleton'
import { addSubmission, deleteSubmission } from './submissions'
import {
  generateRandomSubmission,
  generateRandomStudent,
  generateRandomCourseOffering,
} from './test/utils'
import { Submission } from '@prisma/client'
import { HttpException } from '../exceptions/HttpException'

beforeEach(() => {
  jest.resetAllMocks()
})

// Note: we do not add tests for other service methods as they only call prisma methods

describe('addSubmission', () => {
  test('add succeeds', async () => {
    const student = generateRandomStudent()
    const courseOffering = generateRandomCourseOffering()
    const submissionToAdd = {
      title: 'Test Submission',
      text: 'This is a test submission.',
      matriculationNo: student.matriculationNo,
      courseOfferingId: courseOffering.id,
    }

    const addedSubmission: Submission =
      generateRandomSubmission(submissionToAdd)
    prismaMock.submission.create.mockResolvedValue(addedSubmission)

    const result = addSubmission(submissionToAdd)

    await expect(result).resolves.toEqual({
      ...addedSubmission,
      id: expect.any(Number),
    })
  })
})

describe('deleteSubmission', () => {
  test('delete succeeds', async () => {
    const testSubmission = generateRandomSubmission()

    prismaMock.submission.findFirst.mockResolvedValueOnce(testSubmission)
    prismaMock.submission.delete.mockResolvedValue(testSubmission)

    await expect(deleteSubmission(testSubmission.id)).resolves.toEqual(
      testSubmission
    )
  })

  test('delete fails', async () => {
    prismaMock.submission.findFirst.mockResolvedValueOnce(null)
    try {
      await deleteSubmission(1)
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException)
      const exception = e as HttpException
      expect(exception.message).toMatch(/Submission with id 1 not found/)
    }
  })
})
