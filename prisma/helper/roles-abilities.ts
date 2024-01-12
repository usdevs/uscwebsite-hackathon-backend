import { OrgRole, Prisma } from '@prisma/client'
import { AllRoles } from '@/policy/role'
import { AllAbilities } from '@/policy/abilities'
import { RolesAbilities } from '@/policy/rolesabilities'
import { orgRoleSchema } from './schema'
import { ReadRowsFromExcel } from './util'
import { prisma } from '../../db'

export const seedRoles = async () => {
  console.info('Seeding roles and abilities...')

  for (const r of AllRoles) await prisma.role.create({ data: r })

  console.info('Seeding roles and abilities finished.')
}

export const seedAbilities = async () => {
  console.info('Seeding roles and abilities...')

  for (const a of AllAbilities) await prisma.ability.create({ data: a })

  console.info('Seeding roles and abilities finished.')
}

/**
 * Refer to this for more information:
 * https://www.notion.so/Roles-based-Access-Control-RBAC-8236dee4473d4e36a6c9c4c8dea2ecdd
 */
export const seedRolesAbilities = async () => {
  console.info('Seeding rolesAbilities...')

  // Loop over key value pair
  for (const [roleName, abilityNames] of Object.entries(RolesAbilities)) {
    // Query db for roleID
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    })

    if (!role) {
      throw new Error(
        `Role ${roleName} not found! Please ensure you have seeded roles first. Please check "GetAllRoles" have retrived all the roles`
      )
    }

    // Query db for abilityIDs
    const abilities = await prisma.ability.findMany({
      where: { name: { in: abilityNames } },
    })

    // Add abilities to role
    await prisma.roleAbility
      .createMany({
        data: abilities.map((a) => ({ roleId: role.id, abilityId: a.id })),
      })
      .catch((e) => {
        console.error(e)
        throw new Error(
          `Error adding abilities to role ${roleName}.Please ensure you have seeded abilities first. Please check "GetAllAbilities" have retrived all the abilities`
        )
      })
  }

  console.info('Seeding rolesAbilities finished.')
}

export const seedOrgRoles = async (excelFile: string, sheet: string) => {
  console.info('Seeding orgRoles...')

  const orgRoles = await ReadRowsFromExcel<Omit<OrgRole, 'id'>>(
    excelFile,
    sheet,
    orgRoleSchema
  )

  for (const orgRole of orgRoles) {
    const orgToAdd: Prisma.OrganisationCreateNestedOneWithoutOrgRolesInput = {
      connect: {
        id: orgRole.orgId,
      },
    }

    const roleToAdd: Prisma.RoleCreateNestedOneWithoutOrgRolesInput = {
      connect: {
        id: orgRole.roleId,
      },
    }

    const orgRoleToAdd: Prisma.OrgRoleCreateInput = {
      organisation: orgToAdd,
      role: roleToAdd,
    }

    await prisma.orgRole.create({ data: orgRoleToAdd })
  }

  console.info('Seeding orgRoles finished.')
}
