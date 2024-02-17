import {
  Course,
  CourseOffering,
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
const submissionInclude = {
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
  ay: CourseOffering['ay'],
  semester: CourseOffering['semester']
): Promise<DetailedSubmission[]> {
  return prisma.submission.findMany({
    where: {
      courseOffering: {
        ay,
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

export type SubmissionPayload = Pick<Submission, 'title' | 'text'> & {
  matriculationNo: Student['matriculationNo']
  courseOfferingId: CourseOffering['id']
}
// Add submission
export async function addSubmission({
  title,
  text,
  matriculationNo,
  courseOfferingId,
}: SubmissionPayload): Promise<DetailedSubmission> {
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
          id: courseOfferingId,
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
