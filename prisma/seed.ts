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

const venueData: Prisma.VenueCreateInput[] = [
  {
    name: 'Chatterbox'
  },
  {
    name: 'CTPH',
  },
  {
    name: 'Theme Room Red',
  },
  {
    name: 'Theme Room Blue',
  },
]

const organisationData: Prisma.OrganisationCreateInput[] = [
  {
    name: 'NUSC admin',
    description: "hi i am admin",
    verified: true
  },
  {
    name: 'NUSChess',
    description: 'We play Chess',
    verified: false
  },
  {
    name: 'Ianthe House',
    description: 'purple house',
    verified: false
  },
  {
    name: 'nusc soccer',
    description: 'we play soccer',
    verified: false
  },
]

// TODO: Change to checked create input
const userOnOrgData: Prisma.UserOnOrgUncheckedCreateInput[] = [
  // Alice is in NUSC admin
  {
    userId: 1,
    orgId: 1
  },
  // Bob is in NUSChess
  { 
    userId: 2,
    orgId: 2
  }
]

async function main() {
  console.log(`Start seeding ...`)
  console.log(`Start seeding users...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Start seeding venues...`)
  for (const u of venueData) {
    const venue = await prisma.venue.create({
      data: u,
    })
    console.log(`Created venue with id: ${venue.id}`)
  }
  console.log(`Start seeding organisations...`)
  for (const u of organisationData) {
    const organisation = await prisma.organisation.create({
      data: u,
    })
    console.log(`Created organisation with id: ${organisation.id}`)
  }
  console.log(`Start seeding userOnOrg...`)
  for (const u of userOnOrgData) {
    const userOnOrg = await prisma.userOnOrg.create({
      data: u,
    })
    console.log(`Added user of id ${userOnOrg.userId} into organisation of id ${userOnOrg.orgId}`)
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
