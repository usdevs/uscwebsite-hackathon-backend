import { prisma } from '../../db'
import { Course } from '@prisma/client'

type CoursePayload = {
  code: string
  name: string
}

export async function getAllCourses(): Promise<Course[]> {
  return prisma.course.findMany()
}

export async function getCourseByCode(code: string): Promise<Course | null> {
  return prisma.course.findFirst({
    where: {
      code,
    },
  })
}

export async function addCourse(course: CoursePayload): Promise<Course> {
  return prisma.course.create({
    data: course,
  })
}

export async function updateCourse(
  code: string,
  course: Omit<CoursePayload, 'code'>
): Promise<Course> {
  return prisma.course.update({
    where: {
      code,
    },
    data: course,
  })
}

export async function deleteCourse(code: string): Promise<Course> {
  return prisma.course.delete({
    where: {
      code,
    },
  })
}
