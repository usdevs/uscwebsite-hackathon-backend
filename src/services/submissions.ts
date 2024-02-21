import {
  Course,
  CourseOffering,
  Prisma,
  Professor,
  Student,
  Submission,
} from '@prisma/client'
import { prisma } from '../../db'
import { HttpCode, HttpException } from '@/exceptions'

// Submission should include the Course, Professor and Student associated
export type DetailedSubmission = Submission & {
  student: Student
  courseOffering: CourseOffering & {
    course: Course
    professor: Professor
  }
}

// Helper object to include the Course, Professor and Student associated
export const submissionInclude = {
  courseOffering: {
    include: {
      course: true,
      professor: true,
    },
  },
  student: true,
}

// Get all submissions
export async function getAllSubmissions(): Promise<DetailedSubmission[]> {
  return prisma.submission.findMany({
    include: submissionInclude,
  })
}

// Get submissions by course code e.g. NGN2001
export async function getSubmissionsByCourseCode(
  code: Course['code']
): Promise<DetailedSubmission[]> {
  return prisma.submission.findMany({
    where: {
      courseOffering: {
        course: {
          code,
        },
      },
    },
    include: submissionInclude,
  })
}

// Get submissions by AY and Sem e.g. 2023/2024, Semester 1
export async function getSubmissionsByAYSem(
  academicYear: CourseOffering['academicYear'],
  semester: CourseOffering['semester']
): Promise<DetailedSubmission[]> {
  return prisma.submission.findMany({
    where: {
      courseOffering: {
        academicYear,
        semester,
      },
    },
    include: submissionInclude,
  })
}

// Get submission by id
export async function getSubmissionById(
  id: Submission['id']
): Promise<DetailedSubmission> {
  return prisma.submission.findFirstOrThrow({
    where: { id },
    include: submissionInclude,
  })
}

type CourseOfferingUniqueInput =
  Prisma.CourseOfferingCourseCodeProfessorIdSemesterAcademicYearCompoundUniqueInput

export type SubmissionPayload = Pick<Submission, 'title' | 'text'> & {
  matriculationNo: Student['matriculationNo']
  courseOfferingInput: CourseOfferingUniqueInput
}

async function findUniqueCourseOffering(
  unique: CourseOfferingUniqueInput
): Promise<CourseOffering | null> {
  const { courseCode, professorId, academicYear, semester } = unique
  const courseOffering = await prisma.courseOffering.findFirst({
    where: {
      courseCode,
      professorId,
      academicYear,
      semester,
    },
  })

  return courseOffering
}

// Add submission
export async function addSubmission({
  title,
  text,
  matriculationNo,
  courseOfferingInput,
}: SubmissionPayload): Promise<DetailedSubmission> {
  let courseOffering = await findUniqueCourseOffering(courseOfferingInput)

  const { courseCode, professorId, academicYear, semester } =
    courseOfferingInput

  const courseOfferingExists = !!courseOffering
  if (!courseOfferingExists) {
    // Create course offering
    courseOffering = await prisma.courseOffering.create({
      data: {
        course: {
          connect: {
            code: courseCode,
          },
        },
        professor: {
          connect: {
            id: professorId,
          },
        },
        academicYear,
        semester,
      },
    })
  }

  return prisma.submission.create({
    data: {
      title,
      text,
      student: {
        connect: {
          matriculationNo,
        },
      },
      courseOffering: {
        connect: {
          id: courseOffering!.id,
        },
      },
    },
    include: submissionInclude,
  })
}

// Update submission
export async function updateSubmission(
  id: Submission['id'],
  { title, text }: Pick<Submission, 'title' | 'text'>
): Promise<DetailedSubmission> {
  return prisma.submission.update({
    where: { id },
    data: { title, text },
    include: submissionInclude,
  })
}

// Delete submission
export async function deleteSubmission(
  id: Submission['id']
): Promise<DetailedSubmission> {
  const exists = await prisma.submission.findFirst({ where: { id } })
  if (!exists) {
    throw new HttpException(
      `Submission with id ${id} not found`,
      HttpCode.BadRequest
    )
  }

  return prisma.submission.delete({ where: { id }, include: submissionInclude })
}
