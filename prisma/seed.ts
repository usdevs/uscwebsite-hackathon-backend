import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Alice',
    telegramId: null,
    telegramUserName: 'alice',
    telegramDpUrl: null,
  },
  {
    name: 'Bob',
    telegramId: null,
    telegramUserName: 'bob',
    telegramDpUrl: null,
  },
  {
    name: 'Charlie',
    telegramId: null,
    telegramUserName: 'charlie',
    telegramDpUrl: null,
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
