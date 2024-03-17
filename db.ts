import { Prisma, PrismaClient } from '@prisma/client'
import chalk from 'chalk'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma: PrismaClient<Prisma.PrismaClientOptions, 'query'> =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  })

prisma.$on('query', (e) => {
  // ? Uncomment the following lines to see the queries in the console
  // console.log(chalk.cyan('Query: ' + e.query))
  // console.log(chalk.blue('Params: ' + e.params))
  // console.log(chalk.yellow('Duration: ' + e.duration + 'ms'))
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
