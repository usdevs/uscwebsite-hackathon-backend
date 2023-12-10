import { Booking, Organisation, User, UserOnOrg, Venue } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { IGCategory } from '@prisma/client'

function generateRandomIgCategory() {
  const categories = Object.values(IGCategory)
  return categories[Math.floor(Math.random() * categories.length)]
}

// range: [1..]
const generateRandomTableId: () => number = () =>
  faker.datatype.number({ min: 1 })

export function generateRandomBooking(booking: Partial<Booking>): Booking {
  return {
    id: generateRandomTableId(),
    eventName: faker.lorem.words(),
    venueId: generateRandomTableId(),
    userId: generateRandomTableId(),
    userOrgId: generateRandomTableId(),
    start: faker.datatype.datetime(),
    end: faker.datatype.datetime(),
    bookedAt: faker.datatype.datetime(),
    bookedForOrgId: generateRandomTableId(),
    ...booking,
  }
}

export function generateRandomVenue(): Venue {
  return {
    id: generateRandomTableId(),
    name: faker.company.name(),
  }
}

export function generateRandomUser(): User {
  return {
    id: generateRandomTableId(),
    name: faker.name.firstName(),
    telegramUserName: faker.internet.userName(),
    telegramId: faker.datatype.number().toString(),
    telegramDpUrl: faker.internet.url(),
    deleted: false,
  }
}

export function generateRandomOrganisation(): Organisation {
  return {
    id: generateRandomTableId(),
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    isAdminOrg: false,
    inviteLink: faker.internet.url(),
    slug: faker.lorem.slug(),
    category: generateRandomIgCategory(),
    isInactive: false,
    isInvisible: false,
  }
}

export function generateRandomAdminOrganisation(): Organisation {
  return {
    id: generateRandomTableId(),
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    isAdminOrg: true,
    inviteLink: faker.internet.url(),
    slug: faker.lorem.slug(),
    category: generateRandomIgCategory(),
    isInactive: false,
    isInvisible: false,
  }
}

export function generateUserOnOrg(user: User, org: Organisation): UserOnOrg {
  return {
    userId: user.id,
    orgId: org.id,
    assignedAt: faker.datatype.datetime(),
    deleted: false,
    isIGHead: true, // TODO: change to random?
  }
}
