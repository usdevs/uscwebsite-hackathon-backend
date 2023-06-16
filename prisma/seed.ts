import { PrismaClient, Prisma, IGCategory } from "@prisma/client";
import readXlsxFile from "read-excel-file/node";
import { BookingPayload, addBooking } from "@/services/bookings";
import slugify from "slugify";

const prisma = new PrismaClient();
const excelFile = process.env.EXCEL_SEED_FILEPATH as string;

const mainSheet = "Organisations and IG Heads";
const userSheet = "Users";
const venueSheet = "Venues";
const userOnOrgSheet = "UserOnOrg";

const getDevSheetName = (name: string) => "Test " + name;

type MainSchemaType = {
  id: number
  name: string
  description: string
  organisationType: IGCategory
  frequency?: string
  isOrganisationVerified?: number
  igHeadFullName: string
  inviteOrContactLink?: string
  igHeadTeleUsername: string
  igHeadPreferredName?: string
}

const mainSchema = {
  "id": { prop: "id", type: Number, required: true },
  "name": { prop: "name", type: String, required: true },
  "description": { prop: "description", type: String, required: true },
  "organisationType": {
    prop: "organisationType", type: String, oneOf: ["Sports", "SocioCultural", "Others",
      "Inactive",
      "Guips"], required: true
  },
  "frequency": { prop: "frequency", type: String },
  "isOrganisationVerified": { prop: "isOrganisationVerified", type: Number },
  "igHeadFullName": { prop: "igHeadFullName", type: String, required: true },
  "inviteOrContactLink": { prop: "inviteOrContactLink", type: String },
  "igHeadTeleUsername": { prop: "igHeadTeleUsername", type: String, required: true },
  "igHeadPreferredName": { prop: "igHeadPreferredName", type: String }
};

const userSchema = {
  "id": { prop: "id", type: Number, required: true },
  "telegramUserName": { prop: "telegramUserName", type: String, required: true },
  "name": { prop: "name", type: String, required: true }
};

const venueSchema = {
  "id": { prop: "id", type: Number, required: true },
  "name": { prop: "name", type: String, required: true }
};

const userOnOrgSchema = {
  "userId": { prop: "userId", type: Number, required: true },
  "organisationId": { prop: "orgId", type: Number, required: true }
};

const userData: Prisma.UserUncheckedCreateInput[] = [];
const userDataSet = new Set();
const organisationData: Prisma.OrganisationUncheckedCreateInput[] = [];
const venueData: Prisma.VenueUncheckedCreateInput[] = [];
const userOnOrgData: Prisma.UserOnOrgUncheckedCreateInput[] = [];


const maxSlots = parseEnvToInt("MAX_SLOTS_PER_BOOKING", 4);
const minSlots = parseEnvToInt("MIN_SLOTS_PER_BOOKING", 1);
const duration = parseEnvToInt("DURATION_PER_SLOT", 30);

function parseEnvToInt(envVar: string | undefined, fallback: number): number {
  return (envVar && Number(envVar)) || fallback;
}

function generateBookingData(
  userOnOrgData: Prisma.UserOnOrgUncheckedCreateInput[],
  venueData: Prisma.VenueUncheckedCreateInput[],
  size: Number
) {

  function getRandomDate(from: Date, to: Date) {
    const fromTime = from.getTime();
    const toTime = to.getTime();
    const result = new Date(fromTime + Math.random() * (toTime - fromTime));
    result.setMinutes(result.getMinutes() - result.getMinutes() % duration, 0, 0);
    return result;
  }

  const bookingData: BookingPayload[] = [];

  const bookingDurationData = [...Array(maxSlots - minSlots + 1).keys()].map(i => (i + minSlots) * duration);

  for (let i = 0; i < size; i++) {
    const userOnOrg = userOnOrgData[Math.floor(Math.random() * userOnOrgData.length)];
    const venue = venueData[Math.floor(Math.random() * venueData.length)];
    const bookingDuration = bookingDurationData[Math.floor(Math.random() * bookingDurationData.length)];
    const startDate = getRandomDate(new Date(Date.now() - 12096e5), new Date(Date.now() + 12096e5)); // Magic number because who cares

    const booking = {
      venueId: venue.id!,
      userId: userOnOrg.userId,
      orgId: userOnOrg.orgId,
      start: startDate,
      end: new Date(startDate.getTime() + bookingDuration * 60000), // more magicc
      eventName: Math.random().toString(36).slice(2, 7)
    };

    bookingData.push(booking);
  }
  return bookingData;

}


async function main() {
  const isDevEnv = process.env?.PRISMA_SEED_ENVIRONMENT === "DEV";

  const readUsers = async (userSheetName: string) => {
    await readXlsxFile(excelFile, { sheet: userSheetName, schema: userSchema })
      .then(({ rows, errors }) => {
        if (errors.length !== 0) {
          throw new Error(errors[0].error);
        }
        const casted: Prisma.UserUncheckedCreateInput[] = rows as Prisma.UserUncheckedCreateInput[];
        for (const row of casted) {
          if (!userDataSet.has(row.name)) {
            userDataSet.add(row.name);
            userData.push(row as Prisma.UserUncheckedCreateInput);
          }
        }
      });
  };

  await readUsers(userSheet);

  if (isDevEnv) {
    await readUsers(getDevSheetName(userSheet));
  }

  await readXlsxFile(excelFile, { sheet: venueSheet, schema: venueSchema })
    .then(({ rows, errors }) => {
      if (errors.length !== 0) {
        throw new Error(errors[0].error);
      }
      for (const row of rows) {
        venueData.push(row as Prisma.VenueUncheckedCreateInput);
      }
    });

  let numOfUsers = userData.length + 1;

  await readXlsxFile(excelFile, { sheet: mainSheet, schema: mainSchema })
    .then(({ rows, errors }) => {
      if (errors.length !== 0) {
        throw new Error(errors[0].error);
      }
      const casted: MainSchemaType[] = rows as MainSchemaType[];
      let user: Prisma.UserUncheckedCreateInput;
      let organisation: Prisma.OrganisationUncheckedCreateInput;
      let userOnOrg: Prisma.UserOnOrgUncheckedCreateInput;
      for (const row of casted) {
        organisation = {
          id: row.id, name: row.name,
          verified: row.isOrganisationVerified === 1, category: row.organisationType,
          inviteLink: row.inviteOrContactLink || "https://t.me/" + row.igHeadTeleUsername,
          description: row.description,
          slug: slugify(row.name, {
              replacement: '-',
              remove: /[*+~.()'"!:@]/g,
              lower: true,
              strict: true,
              locale: 'en',
              trim: true
          })
        };
        organisationData.push(organisation);

        user = { name: row.igHeadFullName, telegramUserName: row.igHeadTeleUsername, id: numOfUsers };
        if (!userDataSet.has(user.name)) {
          userDataSet.add(user.name);
          userData.push(user);
        } else {
          const temp: Prisma.UserUncheckedCreateInput = userData.filter(u => user.name === u.name)[0];
          user.id = temp.id;
        }

        userOnOrg = { userId: user.id || 0, orgId: row.id };
        userOnOrgData.push(userOnOrg);

        numOfUsers++;
      }
    });

  const readUserOnOrg = async (sheetname: string) => await readXlsxFile(excelFile, {
    sheet: sheetname,
    schema: userOnOrgSchema
  })
    .then(({ rows, errors }) => {
      if (errors.length !== 0) {
        throw new Error(errors[0].error);
      }
      for (const row of rows) {
        userOnOrgData.push(row as Prisma.UserOnOrgUncheckedCreateInput);
      }
    });

  await readUserOnOrg(userOnOrgSheet);

  if (isDevEnv) {
    await readUserOnOrg(getDevSheetName(userOnOrgSheet));
  }

  console.log(`Start seeding ...`);
  console.log(`Start seeding venues...`);
  for (const u of venueData) {
    const venue = await prisma.venue.create({
      data: u
    });
    console.log(`Created venue with id: ${venue.id}`);
  }
  console.log(`Start seeding organisations...`);
  for (const u of organisationData) {
    const organisation = await prisma.organisation.create({
      data: u
    });
    console.log(`Created organisation with id: ${organisation.id}`);
  }
  console.log(`Start seeding users...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u
    });
    console.log(`Created user with id: ${user.id}`);
  }

  console.log(`Start seeding userOnOrg...`);
  for (const u of userOnOrgData) {
    const userOnOrg = await prisma.userOnOrg.create({
      data: u
    });
    console.log(`Added user of id ${userOnOrg.userId} into organisation of id ${userOnOrg.orgId}`);
  }
  console.log(`Seeding finished.`);

  if (isDevEnv) {
    const bookingData = generateBookingData(userOnOrgData, venueData, 20);

    console.log(`Start seeding bookings...`);
    for (const u of bookingData) {
      try {
        const booking = await addBooking(u);
        console.log(`Added booking of id ${booking.id} created by user of id ${booking.userId}`);
      } catch (error) {
        console.log(error);
      }
    }
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
