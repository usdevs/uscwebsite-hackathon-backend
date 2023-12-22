import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '../../../db'

// https://www.prisma.io/docs/guides/testing/unit-testing#example-unit-tests

jest.mock('../../../db', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(), // "prisma" instead of "default" as we use named exports
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
