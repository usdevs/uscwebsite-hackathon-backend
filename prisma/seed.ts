import { Prisma } from '@prisma/client'
import readXlsxFile from 'read-excel-file/node'
import { BookingPayload, addBooking } from '@/services/bookings'
import { prisma } from '../db'
import {
  parseEnvToInt,
  getDevSheetName,
  generateBookingData,
} from './helper/util'
import {
  readMain,
  readUserOnOrg,
  readFromExcelandSeedUsers,
} from './helper/dataaccess'
import { venueSchema } from './helper/schema'
import {
  seedAbilities,
  seedOrgRoles,
  seedRoles,
  seedRolesAbilities,
  seedVenueRoles,
} from './helper/roles-abilities'
import { seedDevInfo } from './helper/dev-info'
import {
  seedCourseOfferings,
  seedCourses,
  seedProfessors,
  seedStudents,
  seedSubmissions,
} from './helper/submissions'

const excelFile = process.env.EXCEL_SEED_FILEPATH as string

const mainSheet = 'Organisations and IG Heads'
const userSheet = 'Users'
const venueSheet = 'Venues'
const userOnOrgSheet = 'UserOnOrg'
const orgRoleSheet = 'OrgRoles'

const userDataSet = new Set()

const maxSlots = parseEnvToInt('MAX_SLOTS_PER_BOOKING', 4)
const minSlots = parseEnvToInt('MIN_SLOTS_PER_BOOKING', 1)
const duration = parseEnvToInt('DURATION_PER_SLOT', 30)

async function main() {
  const isDevEnv = process.env?.PRISMA_SEED_ENVIRONMENT === 'DEV'

  console.log(`Seed initial users...`)
  await readFromExcelandSeedUsers(excelFile, userSheet, userDataSet)
  // grant access to developers even on prod
  await readFromExcelandSeedUsers(
    excelFile,
    getDevSheetName(userSheet),
    userDataSet
  )
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id)+1, 1), false) FROM "User";`

  await seedDevInfo()

  console.log(`Start seeding venues...`)
  await readXlsxFile(excelFile, {
    sheet: venueSheet,
    schema: venueSchema,
  }).then(async ({ rows, errors }) => {
    if (errors.length !== 0) {
      throw new Error(errors[0].error)
    }
    for (const row of rows) {
      const venue = await prisma.venue.create({
        data: row as Prisma.VenueCreateInput,
      })
      console.log(`Created venue with id: ${venue.id}`)
    }
  })

  await readMain(excelFile, mainSheet, userDataSet)
  if (isDevEnv)
    await readMain(excelFile, getDevSheetName(mainSheet), userDataSet)

  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Organisation"', 'id'), coalesce(max(id)+1, 1), false) FROM "Organisation";`

  await readUserOnOrg(excelFile, userOnOrgSheet)
  // grand access to developers even on prod
  await readUserOnOrg(excelFile, getDevSheetName(userOnOrgSheet))

  await seedAbilities()
  await seedRoles()
  await seedRolesAbilities()
  await seedOrgRoles(excelFile, orgRoleSheet)

  if (!isDevEnv) {
    console.log(`Seeding finished.`)
    return
  }

  console.info('seeding dev data...')

  await seedOrgRoles(excelFile, getDevSheetName(orgRoleSheet))
  await seedVenueRoles()
  // Folio Submissions
  await seedCourses()
  await seedProfessors()
  await seedStudents()
  await seedCourseOfferings()
  await seedSubmissions()

  const NUMBER_OF_RANDOM_BOOKINGS = 200
  const bookingData: BookingPayload[] = await generateBookingData(
    NUMBER_OF_RANDOM_BOOKINGS,
    maxSlots,
    minSlots,
    duration
  )
  console.log(`Start seeding bookings...`)

  for (const u of bookingData) {
    try {
      const booking = await addBooking(u)
      console.log(
        `Added booking of id ${booking.id} created by user of id ${booking.userId}`
      )
    } catch (error) {
      console.log(error)
    }
  }

  console.log(`Seeding finished.`)
}

let status: number

main()
  .then(() => {
    status = 0
  })
  .catch((e) => {
    status = 1
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(status)
  })
