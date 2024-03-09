import {
  Ability,
  Booking,
  Course,
  CourseOffering,
  Organisation,
  Professor,
  Role,
  Semester,
  Student,
  Submission,
  User,
  UserOnOrg,
  Venue,
} from '@prisma/client'
import { faker } from '@faker-js/faker'
import { IGCategory } from '@prisma/client'
import { DetailedSubmission, SubmissionPayload } from '../submissions'

function generateRandomIgCategory() {
  const categories = Object.values(IGCategory)
  return categories[Math.floor(Math.random() * categories.length)]
}

// range: [1..]
const generateRandomTableId: () => number = () =>
  faker.datatype.number({ min: 1 })

export function generateRandomBooking(booking?: Partial<Booking>): Booking {
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

export function generateRandomUser(user?: Partial<User>): User {
  return {
    id: generateRandomTableId(),
    name: faker.name.firstName(),
    telegramUserName: faker.internet.userName(),
    telegramId: faker.datatype.number().toString(),
    telegramDpUrl: faker.internet.url(),
    deleted: false,
    ...user,
  }
}

export function generateRandomOrganisation(
  org?: Partial<Organisation>
): Organisation {
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
    ...org,
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

export function generateRandomAbility(Ability?: Partial<Ability>): Ability {
  return {
    id: generateRandomTableId(),
    name: faker.lorem.words(),
    description: faker.lorem.paragraph(),
    createdAt: faker.datatype.datetime(),
    ...Ability,
  }
}

export function generateRandomRole(Role?: Partial<Role>): Role {
  return {
    id: generateRandomTableId(),
    name: faker.lorem.words(),
    createdAt: faker.datatype.datetime(),
    ...Role,
  }
}

// Stylio
export function generateRandomProfessor(
  professor?: Partial<Professor>
): Professor {
  return {
    id: generateRandomTableId(),
    name: faker.name.firstName(),
    ...professor,
  }
}

export function generateRandomCourse(course?: Partial<Course>): Course {
  return {
    code: faker.lorem.slug(1),
    name: faker.lorem.words(),
    ...course,
  }
}

export function generateRandomCourseOfferingUniqueInput() {
  return {
    courseCode: faker.lorem.slug(1),
    professorId: generateRandomTableId(),
    academicYear: faker.datatype.number({ min: 2019, max: 2025 }),
    semester: faker.helpers.arrayElement([
      'Semester1',
      'Semester2',
    ]) as Semester,
  }
}

export function generateRandomCourseOffering(
  courseOffering?: Partial<CourseOffering>
): CourseOffering {
  return {
    id: generateRandomTableId(),
    ...generateRandomCourseOfferingUniqueInput(),
    ...courseOffering,
  }
}

export function generateRandomStudent(student?: Partial<Student>): Student {
  return {
    id: generateRandomTableId(),
    matriculationNo: faker.datatype.number().toString(),
    name: faker.name.firstName(),
    ...student,
  }
}

export function generateRandomSubmission(
  submission?: Partial<Submission>
): Submission {
  return {
    id: generateRandomTableId(),
    title: faker.lorem.words(),
    text: faker.lorem.paragraph(),
    lastUpdated: faker.datatype.datetime(),
    isPublished: faker.datatype.boolean(),
    studentId: generateRandomTableId(),
    courseOfferingId: generateRandomTableId(),
    ...submission,
  }
}

export function generateRandomSubmissionPayload(
  submissionPayload?: Partial<SubmissionPayload>
): SubmissionPayload {
  return {
    title: faker.lorem.words(),
    text: faker.lorem.paragraph(),
    matriculationNo: faker.datatype.number().toString(),
    courseOfferingInput: generateRandomCourseOfferingUniqueInput(),
    ...submissionPayload,
  }
}

export function generateRandomDetailedSubmission(
  submission?: Partial<Submission>,
  course?: Partial<Course>,
  professor?: Partial<Professor>,
  student?: Partial<Student>
): DetailedSubmission {
  return {
    ...generateRandomSubmission(submission),
    courseOffering: {
      ...generateRandomCourseOffering(),
      course: {
        ...generateRandomCourse(course),
      },
      professor: {
        ...generateRandomProfessor(professor),
      },
    },
    student: {
      ...generateRandomStudent(student),
    },
  }
}
