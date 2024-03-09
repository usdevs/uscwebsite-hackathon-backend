import { prisma } from '../../db'
import { Professor } from '@prisma/client'

type ProfessorPayload = {
  name: string
}

export async function getAllProfessors(): Promise<Professor[]> {
  return prisma.professor.findMany()
}

export async function getProfessorById(id: number): Promise<Professor | null> {
  return prisma.professor.findFirst({
    where: {
      id,
    },
  })
}

export async function addProfessor(
  professor: ProfessorPayload
): Promise<Professor> {
  return prisma.professor.create({
    data: professor,
  })
}

export async function updateProfessor(
  id: number,
  professor: ProfessorPayload
): Promise<Professor> {
  return prisma.professor.update({
    where: {
      id,
    },
    data: professor,
  })
}

export async function deleteProfessor(id: number): Promise<Professor> {
  return prisma.professor.delete({
    where: {
      id,
    },
  })
}
