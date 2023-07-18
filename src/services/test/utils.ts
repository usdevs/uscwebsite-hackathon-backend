import { Booking, Organisation, User, UserOnOrg, Venue } from '@prisma/client'
import { faker } from '@faker-js/faker'

// range: [1..]
const generateRandomTableId: () => number = () =>
  faker.datatype.number({ min: 1 })

export function generateRandomBooking(booking: Partial<Booking>): Booking {
  return {
    id: generateRandomTableId(),
    venueId: generateRandomTableId(),
    orgId: generateRandomTableId(),
    userId: generateRandomTableId(),
    start: faker.datatype.datetime(),
    end: faker.datatype.datetime(),
    bookedAt: faker.datatype.datetime(),
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
  }
}

export function generateRandomAdminOrganisation(): Organisation {
  return {
    id: generateRandomTableId(),
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    isAdminOrg: true,
  }
}

export function generateUserOnOrg(user: User, org: Organisation): UserOnOrg {
  return {
    userId: user.id,
    orgId: org.id,
    assignedAt: faker.datatype.datetime(),
    deleted: false,
  }
}
