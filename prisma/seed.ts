import { PrismaClient, Prisma } from '@prisma/client'
import readXlsxFile from 'read-excel-file/node';

const prisma = new PrismaClient()
const excelFile = process.env.EXCEL_SEED_FILEPATH as string;

const organisationSheet = "Test Organisations"
const userSheet = "Test Users"
const venueSheet = "Venues"

const organisationSchema = {
  'id': { prop: 'id', type: Number, required: true },
  'name': { prop: 'name', type: String, required: true },
  'description': { prop: 'description', type: String },
  'verified': { prop: 'verified', type: Boolean }
}

const userSchema = {
  'id': { prop: 'id', type: Number, required: true },
  'telegramUserName': { prop: 'telegramUserName', type: String, required: true },
  'name': { prop: 'name', type: String, required: true },
  'userOrg': {
    prop: 'userOrg', type: {
      'create': {
        prop: 'create',
        type: {
          'org': {
            prop: 'org',
            type: {
              'connect': {
                prop: 'connect',
                type: {
                  'organisationId': {
                    prop: 'id',
                    type: Number,
                    required: true
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

const venueSchema = {
  'id': { prop: 'id', type: Number, required: true },
  'name': { prop: 'name', type: String, required: true }
}

const userData: Prisma.UserCreateInput[] = [];
const organisationData: Prisma.OrganisationCreateInput[] = [];
const venueData: Prisma.VenueCreateInput[] = [];



async function main() {
  await readXlsxFile(excelFile, { sheet: organisationSheet, schema: organisationSchema })
    .then(({ rows, errors }) => {
      if (errors.length !== 0) {
        throw new Error(errors[0].error);
      }
      for (const row of rows) {
        organisationData.push(row as Prisma.OrganisationCreateInput);
      }
    });

  await readXlsxFile(excelFile, { sheet: userSheet, schema: userSchema })
    .then(({ rows, errors }) => {
      if (errors.length !== 0) {
        throw new Error(errors[0].error);
      }
      for (const row of rows) {
        userData.push(row as Prisma.UserCreateInput)
      }
    });

  await readXlsxFile(excelFile, { sheet: venueSheet, schema: venueSchema })
    .then(({ rows, errors }) => {
      if (errors.length !== 0) {
        throw new Error(errors[0].error);
      }
      for (const row of rows) {
        venueData.push(row as Prisma.VenueCreateInput);
      }
    });

  console.log(`Start seeding ...`)
  console.log(`Start seeding users...`)
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
