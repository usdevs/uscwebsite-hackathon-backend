import { getSlugFromIgName } from '@/config/common'
import { prisma } from '../db'
import {
  seedAbilities,
  seedRoles,
  seedRolesAbilities,
  seedVenueRoles,
} from './helper/roles-abilities'
import { seedCourses, seedProfessors, seedStudents } from './helper/submissions'
import {
  AcadsAdminRole,
  ButteryAdminRole,
  MemberRole,
  OrganisationHeadRole,
  SpacesAdminRole,
  WebsiteAdminRole,
} from '@/policy'
import { Prisma } from '@prisma/client'

export async function seedProdOrgRoles() {
  const otherMembersUserNames: Record<string, string[]> = {
    'NUSCC Acads Team': ['migahfoo', 'horangu', 'sinkingshipss', 'llixfell'],
    'NUSCC Makers Team': [
      'arhaanjain',
      'matchadrinksmatcha',
      'kimtrakarnwichit',
      'saatvikagrawal',
      'limjh16',
      'reubenth',
      'I_AM_atomikk',
    ],
    'NUSCC Spaces Team': [
      'swwchoi',
      'matchadrinksmatcha',
      'icedjam',
      'racheltre',
      'calistayx',
      'gr4cel',
      'dxilary',
      'nigelteh',
    ],
    'NUSCC Tech Team': [
      'WXiaoyun',
      'LQ_Xu',
      'bluestarandfireheart',
      'skylerng',
      'iuhiah',
      'timpipi',
      'tringa',
      'Jukezter',
      'peasantbird',
      'reubenth',
      'opticalcloud',
    ],
    'Buttery Team': [
      'carinateh',
      'jemmacheah',
      'jeremyyong128',
      'owenyeoo',
      'ymirmeddeb',
    ],
  }

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
      userOrg: {
        create: {
          userId: 41, // Jackson
          isIGHead: true,
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
      userOrg: {
        create: {
          userId: 226, // Soham
          isIGHead: true,
        },
      },
    },
    {
      name: 'NUSCC Spaces Team',
      description: 'NUSCC Spaces',
      inviteLink: '',
      isInvisible: true,
      slug: getSlugFromIgName('NUSCC Spaces Team'),
      category: 'Others',
      orgRoles: {
        create: {
          roleId: SpacesAdminRole.id,
        },
      },
      userOrg: {
        create: {
          userId: 123, // Mahima
          isIGHead: true,
        },
      },
    },
    {
      name: 'NUSCC Tech Team',
      description: 'NUSCC Tech',
      inviteLink: '',
      isInvisible: true,
      slug: getSlugFromIgName('NUSCC Tech Team'),
      category: 'Others',
      orgRoles: {
        create: {
          roleId: WebsiteAdminRole.id,
        },
      },
      userOrg: {
        create: {
          userId: 24, // Megan
          isIGHead: true,
        },
      },
    },
    {
      name: 'Buttery Team',
      description: 'Manages the Buttery spaces',
      inviteLink: '',
      isInvisible: true,
      slug: getSlugFromIgName('Buttery Team'),
      category: 'Others',
      orgRoles: {
        create: {
          roleId: ButteryAdminRole.id,
        },
      },
      userOrg: {
        create: {
          userId: 79, // Carina
          isIGHead: true,
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

    const { id } = await prisma.organisation.create({
      data: org,
    })

    const otherMembers = otherMembersUserNames[org.name]
    if (!otherMembers) {
      throw new Error(`No other members found for org ${org.name}`)
    }

    for (const username of otherMembers) {
      const user = await prisma.user.findFirst({
        where: {
          telegramUserName: username,
        },
      })

      if (!user) {
        console.log(`User with username ${username} not found. Skipping...`)
        continue
      }

      // Add these new members to the org
      await prisma.userOnOrg.create({
        data: {
          userId: user.id,
          orgId: id,
        },
      })
    }
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
        roleId: OrganisationHeadRole.id,
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
  await seedVenueRoles()

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
