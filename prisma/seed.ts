import { Prisma, IGCategory, Venue, User, UserOnOrg } from "@prisma/client";
import readXlsxFile from "read-excel-file/node";
import { BookingPayload, addBooking } from "@/services/bookings";
import { getSlugFromIgName } from "@/config/common";
import { prisma } from '../db'

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
  isAdminOrg?: number
  igHeadFullName: string
  inviteOrContactLink?: string
  igHeadTeleUsername: string
  otherMembers?: string
  otherMembersTeleUsername?: string
  isInactive?: number
  isInvisible?: number
}

const mainSchema = {
  "id": { prop: "id", type: Number, required: true },
  "name": { prop: "name", type: String, required: true },
  "description": { prop: "description", type: String },
  "organisationType": {
    prop: "organisationType", type: String, oneOf: ["Sports", "SocioCultural", "Others",
      "Inactive",
      "Guips"], required: true
  },
  "frequency": { prop: "frequency", type: String },
  "isAdminOrg": { prop: "isAdminOrg", type: Number },
  "igHeadFullName": { prop: "igHeadFullName", type: String, required: true },
  "inviteOrContactLink": { prop: "inviteOrContactLink", type: String },
  "igHeadTeleUsername": { prop: "igHeadTeleUsername", type: String, required: true },
  "otherMembers": { prop: "otherMembers", type: String },
  "otherMembersTeleUsername": { prop: "otherMembersTeleUsername", type: String },
  "isInactive": { prop: "isInactive", type: Number },
  "isInvisible": { prop: "isInvisible", type: Number }
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

type UserOnOrgSchemaType = {
  userId: number,
  orgId: number,
  isIGHead: number
}

const userOnOrgSchema = {
  "userId": { prop: "userId", type: Number, required: true },
  "orgId": { prop: "orgId", type: Number, required: true },
  "isIGHead": { prop: "isIGHead", type: Number, required: true }
};

const userDataSet = new Set();

const maxSlots = parseEnvToInt("MAX_SLOTS_PER_BOOKING", 4);
const minSlots = parseEnvToInt("MIN_SLOTS_PER_BOOKING", 1);
const duration = parseEnvToInt("DURATION_PER_SLOT", 30);

function parseEnvToInt(envVar: string | undefined, fallback: number): number {
  return (envVar && Number(envVar)) || fallback;
}

async function generateBookingData(
  size: Number
) {
  const allUserOnOrg: Array<UserOnOrg> = await prisma.userOnOrg.findMany()
  const allVenues: Array<Venue> = await prisma.venue.findMany()

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
    const userOnOrg = allUserOnOrg[Math.floor(Math.random() * allUserOnOrg.length)];
    const venue = allVenues[Math.floor(Math.random() * allVenues.length)];
    const bookingDuration = bookingDurationData[Math.floor(Math.random() * bookingDurationData.length)];
    const startDate = getRandomDate(new Date(Date.now() - 12096e5), new Date(Date.now() + 12096e5)); // Magic number because who cares

    const booking = {
      venueId: venue.id!,
      userId: userOnOrg.userId,
      userOrgId: userOnOrg.orgId,
      start: startDate,
      end: new Date(startDate.getTime() + bookingDuration * 60000), // more magicc
      eventName: Math.random().toString(36).slice(2, 7)
    };

    bookingData.push(booking);
  }
  return bookingData;

}

const addUserToUserTable = async (u: Prisma.UserUncheckedCreateInput): Promise<number> => {
  const user = await prisma.user.create({
    data: u
  });
  console.log(`Created user with id: ${user.id}`);
  return user.id
}

const addOrgToTable = async (u: Prisma.OrganisationUncheckedCreateInput): Promise<number> => {
  const organisation = await prisma.organisation.create({
    data: u
  });
  console.log(`Created organisation with id: ${organisation.id}`);
  return organisation.id
}

const addUserOnOrgToTable = async (userId: number, orgId: number, isIGHead: boolean) => {
  const orgToAdd: Prisma.OrganisationCreateNestedOneWithoutUserOrgInput = {
    connect: {
      id: orgId
    }
  }
  const userToAdd: Prisma.UserCreateNestedOneWithoutUserOrgInput = {
    connect: {
      id: userId
    }
  }
  const userOnOrgInput: Prisma.UserOnOrgCreateInput = { user: userToAdd, org: orgToAdd, isIGHead };

  const userOnOrg = await prisma.userOnOrg.create({
    data: userOnOrgInput
  });
  console.log(`Added user of id ${userOnOrg.userId} into organisation of id ${userOnOrg.orgId}`);
}

const addFolioToTable = async () => {
  // Seed for Course
  const course1 = await prisma.course.create({
    data: { code: 'NTW2001', name: 'Cosmopolitanism and Global Citizenship' },
  });
  
  // Seed for Professor
  const professor1 = await prisma.professor.create({
    data: { name: 'Dr. Leung Wing Sze' },
  });

  // Seed for Teach
  const teach1 = await prisma.teach.create({
    data: {
      ay: '2023/2024',
      semester: '1',
      courseCode: course1.code,
      professorId: professor1.id,
    },
  });

  // Seed for Student
  const student1 = await prisma.student.create({
    data: { name: 'Alice', nusId: 'A01234567' },
  });

  // Seed for Submission
  const submission1 = await prisma.submission.create({
    data: { title: 'My First Submission', text: 'This is a test submission.' },
  });

  // Seed for Submit
  await prisma.submit.create({
    data: {
      submissionId: submission1.id,
      studentId: student1.id,
      teachId: teach1.teachId,
    },
  });
}

async function main() {
  const isDevEnv = process.env?.PRISMA_SEED_ENVIRONMENT === "DEV";

  const readUsers = async (userSheetName: string) => {
    await readXlsxFile(excelFile, { sheet: userSheetName, schema: userSchema })
      .then(async ({ rows, errors }) => {
        if (errors.length !== 0) {
          throw new Error(errors[0].error);
        }
        const casted: Prisma.UserUncheckedCreateInput[] = rows as Prisma.UserUncheckedCreateInput[];
        for (const row of casted) {
          if (!userDataSet.has(row.name)) {
            userDataSet.add(row.name);
            await addUserToUserTable(row);
          }
        }
      });
  };

  console.log(`Seed initial users...`);
  await readUsers(userSheet);
  // grant access to developers even on prod
  await readUsers(getDevSheetName(userSheet));
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id)+1, 1), false) FROM "User";`;

  console.log(`Start seeding venues...`);
  await readXlsxFile(excelFile, { sheet: venueSheet, schema: venueSchema })
    .then(async ({ rows, errors }) => {
      if (errors.length !== 0) {
        throw new Error(errors[0].error);
      }
      for (const row of rows) {
        const venue = await prisma.venue.create({
          data: (row as Prisma.VenueCreateInput)
        });
        console.log(`Created venue with id: ${venue.id}`);
      }
    });

  const readMain = async (mainSheetName: string) => {
    return await readXlsxFile(excelFile, { sheet: mainSheetName, schema: mainSchema })
      .then(async ({ rows, errors }) => {
        if (errors.length !== 0) {
          throw new Error(errors[0].error);
        }
        const casted: MainSchemaType[] = rows as MainSchemaType[];

        const addUserIfNotAddedAndGetIdOfUser = async (userToAdd: Prisma.UserCreateInput): Promise<number> => {
          if (!userDataSet.has(userToAdd.name)) {
            userDataSet.add(userToAdd.name);
            return await addUserToUserTable(userToAdd)
          }
          else {
            const igHeadUser: User = await prisma.user.findFirstOrThrow({
              where: {
                name: userToAdd.name
              }
            })
            return igHeadUser.id
          }
        }

        console.log(`Start seeding organisations and userOnOrg...`);
        for (const row of casted) {
          const organisation: Prisma.OrganisationUncheckedCreateInput = {
            id: row.id, name: row.name,
            isAdminOrg: row.isAdminOrg === 1, category: row.organisationType,
            inviteLink: row.inviteOrContactLink || "https://t.me/" + row.igHeadTeleUsername,
            description: row.description,
            slug: getSlugFromIgName(row.name),
            isInactive: row.isInactive === 1,
            isInvisible: row.isInvisible === 1
          };

          const orgId = await addOrgToTable(organisation);
          const igHead: Prisma.UserCreateInput = {
            name: row.igHeadFullName,
            telegramUserName: row.igHeadTeleUsername,
          };
          const userId = await addUserIfNotAddedAndGetIdOfUser(igHead);

          await addUserOnOrgToTable(userId, orgId, true);

          const otherUsersNames: string[] = row.otherMembers?.split(';') || []
          const otherUsersTelegramUsernames: string[] = row.otherMembersTeleUsername?.split(';') || []
          if (otherUsersTelegramUsernames.length !== otherUsersNames.length) {
            throw new Error(`For ${organisation.name} Lengths of otherMembersTeleUsername and otherMembers do not add up`)
          }
          const otherUsers: Prisma.UserCreateInput[] = otherUsersNames.map((otherUsersName, index) => {
            return { name: otherUsersName, telegramUserName: otherUsersTelegramUsernames[index]}
          })
          for (const otherUser of otherUsers) {
            const userId = await addUserIfNotAddedAndGetIdOfUser(otherUser);
            await addUserOnOrgToTable(userId, orgId, true);
          }
        }
      });
  }

  await readMain(mainSheet)
  if (isDevEnv) {
    await readMain(getDevSheetName(mainSheet))
  }
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Organisation"', 'id'), coalesce(max(id)+1, 1), false) FROM "Organisation";`;

  const readUserOnOrg = async (sheetname: string) => await readXlsxFile(excelFile, {
    sheet: sheetname,
    schema: userOnOrgSchema
  })
    .then(async ({ rows, errors }) => {
      if (errors.length !== 0) {
        throw new Error(errors[0].error);
      }
      const casted: UserOnOrgSchemaType[] = rows as UserOnOrgSchemaType[];
      for (const row of casted) {
        // we don't need to get the id from prisma again, but just to make sure
        const user = await prisma.user.findUniqueOrThrow({
          where: {
            id: row.userId
          }
        })
        const org = await prisma.organisation.findUniqueOrThrow({
          where: {
            id: row.orgId
          }
        })
        await addUserOnOrgToTable(user.id, org.id, row.isIGHead === 1)
      }
    });

  await readUserOnOrg(userOnOrgSheet);

  // grand access to developers even on prod
  await readUserOnOrg(getDevSheetName(userOnOrgSheet));
  
  // TODO: Seed Folio Courses and Profs
  await addFolioToTable

  console.log(`Seeding finished.`);

  if (isDevEnv) {
    const NUMBER_OF_RANDOM_BOOKINGS = 1000
    const bookingData: BookingPayload[] = await generateBookingData(NUMBER_OF_RANDOM_BOOKINGS);

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
