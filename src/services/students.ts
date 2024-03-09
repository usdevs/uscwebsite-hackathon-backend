import { prisma } from '../../db'
import { Student } from '@prisma/client'

type StudentPayload = {
  name: string
  matriculationNo: string
}

export async function getAllStudents(): Promise<Student[]> {
  return prisma.student.findMany()
}

export async function getStudentByMatriculationNo(
  matriculationNo: string
): Promise<Student | null> {
  return prisma.student.findFirst({
    where: {
      matriculationNo,
    },
  })
}

export async function addStudent(student: StudentPayload): Promise<Student> {
  return prisma.student.create({
    data: student,
  })
}

export async function updateStudent(
  matriculationNo: string,
  student: Omit<StudentPayload, 'matriculationNo'>
): Promise<Student> {
  return prisma.student.update({
    where: {
      matriculationNo,
    },
    data: student,
  })
}

export async function deleteStudent(matriculationNo: string): Promise<Student> {
  return prisma.student.delete({
    where: {
      matriculationNo,
    },
  })
}
