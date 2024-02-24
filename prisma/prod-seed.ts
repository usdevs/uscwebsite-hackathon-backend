import { getSlugFromIgName } from '@/config/common'
import { prisma } from '../db'
import {
  seedAbilities,
  seedRoles,
  seedRolesAbilities,
} from './helper/roles-abilities'
import { seedCourses, seedProfessors, seedStudents } from './helper/submissions'
import {
  AcadsAdminRole,
  BookingAdminRole,
  MemberRole,
  SpacesAdminRole,
  WebsiteAdminRole,
} from '@/policy'
import { Prisma } from '@prisma/client'

async function seedProdOrgRoles() {
  const data: Prisma.OrganisationCreateInput[] = [
    {
      name: 'NUSCC Acads Team',
      description: 'NUSCC Acads ',
      inviteLink: '',
      isInvisible: true,
      slug: getSlugFromIgName('NUSCC Acads Team'),
      category: 'Others',
      orgRoles: {
        create: {
          roleId: AcadsAdminRole.id,
        },
      },
    },
    {
      name: 'NUSCC Makers Team',
      description: 'NUSCC Makers',
      inviteLink: '',
      isInvisible: true,
      slug: getSlugFromIgName('NUSCC Makers Team'),
      category: 'Others',
      orgRoles: {
        create: {
          roleId: SpacesAdminRole.id,
        },
      },
    },
  ]

  for (const org of data) {
    const existingOrg = await prisma.organisation.findUnique({
      where: {
        slug: org.slug,
      },
    })

    if (existingOrg) {
      console.log(`Organisation with slug ${org.slug} already exists`)
      continue
    }

    await prisma.organisation.create({
      data: org,
    })
  }

  const adminTeamOrgId = 75
  const mcTeamOrgId = 67
  await prisma.orgRole.createMany({
    data: [
      {
        orgId: adminTeamOrgId,
        roleId: WebsiteAdminRole.id,
      },
      {
        orgId: mcTeamOrgId,
        roleId: WebsiteAdminRole.id,
      },
    ],
  })

  const residentialTeamOrgId = 74
  await prisma.orgRole.createMany({
    data: [
      {
        orgId: residentialTeamOrgId,
        roleId: BookingAdminRole.id,
      },
    ],
  })

  // Add member role to all orgs

  const orgs = await prisma.organisation.findMany()

  for (const org of orgs) {
    await prisma.orgRole.create({
      data: {
        organisation: {
          connect: {
            id: org.id,
          },
        },
        role: {
          connect: {
            id: MemberRole.id,
          },
        },
      },
    })
  }
}

async function main() {
  const isDevEnv = process.env?.PRISMA_SEED_ENVIRONMENT === 'DEV'
  await seedAbilities()
  await seedRoles()
  await seedRolesAbilities()

  await seedCourses()
  await seedProfessors()
  await seedStudents()

  await seedProdOrgRoles()
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
