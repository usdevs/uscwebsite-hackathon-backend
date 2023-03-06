import prisma from './db'
import { Organisation } from '@prisma/client'
import { HttpCode, HttpException } from '@/exceptions/HttpException'

/* Retrieves all organisations */
export async function getAllOrgs(): Promise<Organisation[]> {
  return await prisma.organisation.findMany()
}
