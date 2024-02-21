import { prismaMock } from './test/singleton'
import {
  addSubmission,
  deleteSubmission,
  submissionInclude,
} from './submissions'
import {
  generateRandomSubmission,
  generateRandomStudent,
  generateRandomCourseOffering,
  generateRandomCourseOfferingUniqueInput,
} from './test/utils'
import { Submission } from '@prisma/client'
import { HttpException } from '../exceptions/HttpException'

beforeEach(() => {
  jest.resetAllMocks()
})

// Note: we do not add tests for other service methods as they only call prisma methods

describe('addSubmission', () => {
  test('add succeeds when courseOffering exists', async () => {
    const courseOffering = generateRandomCourseOffering()
    prismaMock.courseOffering.findFirst.mockResolvedValue(courseOffering)

    const submissionToAdd = {
      title: 'Test Submission',
      text: 'This is a test submission.',
      matriculationNo: '12345678',
      courseOfferingInput: courseOffering,
    }
    const addedSubmission = generateRandomSubmission(submissionToAdd)
    prismaMock.submission.create.mockResolvedValue(addedSubmission)

    const result = await addSubmission(submissionToAdd)

    expect(result).toEqual(addedSubmission)
    expect(prismaMock.courseOffering.findFirst).toHaveBeenCalledWith({
      where: {
        courseCode: courseOffering.courseCode,
        professorId: courseOffering.professorId,
        academicYear: courseOffering.academicYear,
        semester: courseOffering.semester,
      },
    })
    expect(prismaMock.submission.create).toHaveBeenCalledWith({
      data: {
        title: submissionToAdd.title,
        text: submissionToAdd.text,
        student: {
          connect: {
            matriculationNo: submissionToAdd.matriculationNo,
          },
        },
        courseOffering: {
          connect: {
            id: courseOffering.id,
          },
        },
      },
      include: submissionInclude,
    })
  })

  test('add succeeds and creates courseOffering if it does not exist', async () => {
    const courseOfferingInput = generateRandomCourseOfferingUniqueInput()
    prismaMock.courseOffering.findFirst.mockResolvedValue(null)
    const newCourseOffering = generateRandomCourseOffering()
    prismaMock.courseOffering.create.mockResolvedValue(newCourseOffering)
    const submissionToAdd = {
      title: 'Test Submission',
      text: 'This is a test submission.',
      matriculationNo: '12345678',
      courseOfferingInput,
    }
    const addedSubmission = generateRandomSubmission(submissionToAdd)
    prismaMock.submission.create.mockResolvedValue(addedSubmission)

    const result = await addSubmission(submissionToAdd)

    expect(result).toEqual(addedSubmission)
    expect(prismaMock.courseOffering.findFirst).toHaveBeenCalledWith({
      where: {
        courseCode: courseOfferingInput.courseCode,
        professorId: courseOfferingInput.professorId,
        academicYear: courseOfferingInput.academicYear,
        semester: courseOfferingInput.semester,
      },
    })
    expect(prismaMock.courseOffering.create).toHaveBeenCalledWith({
      data: {
        course: {
          connect: {
            code: courseOfferingInput.courseCode,
          },
        },
        professor: {
          connect: {
            id: courseOfferingInput.professorId,
          },
        },
        academicYear: courseOfferingInput.academicYear,
        semester: courseOfferingInput.semester,
      },
    })
    expect(prismaMock.submission.create).toHaveBeenCalledWith({
      data: {
        title: submissionToAdd.title,
        text: submissionToAdd.text,
        student: {
          connect: {
            matriculationNo: submissionToAdd.matriculationNo,
          },
        },
        courseOffering: {
          connect: {
            id: newCourseOffering.id,
          },
        },
      },
      include: submissionInclude,
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
