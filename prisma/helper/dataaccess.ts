import readXlsxFile from 'read-excel-file/node'
import { Prisma, User } from '@prisma/client'
import { getSlugFromIgName } from '@/config/common'
import {
  MainSchemaType,
  UserOnOrgSchemaType,
  mainSchema,
  userOnOrgSchema,
  userSchema,
} from './schema'
import { prisma } from '../../db'

export const addUserToUserTable = async (
  u: Prisma.UserUncheckedCreateInput
): Promise<number> => {
  const user = await prisma.user.create({
    data: u,
  })
  console.log(`Created user with id: ${user.id}`)
  return user.id
}

export const addOrgToTable = async (
  u: Prisma.OrganisationUncheckedCreateInput
): Promise<number> => {
  const organisation = await prisma.organisation.create({
    data: u,
  })
  console.log(`Created organisation with id: ${organisation.id}`)
  return organisation.id
}

const addUserOnOrgToTable = async (
  userId: number,
  orgId: number,
  isIGHead: boolean
) => {
  const orgToAdd: Prisma.OrganisationCreateNestedOneWithoutUserOrgInput = {
    connect: {
      id: orgId,
    },
  }
  const userToAdd: Prisma.UserCreateNestedOneWithoutUserOrgInput = {
    connect: {
      id: userId,
    },
  }
  const userOnOrgInput: Prisma.UserOnOrgCreateInput = {
    user: userToAdd,
    org: orgToAdd,
    isIGHead,
  }

  const userOnOrg = await prisma.userOnOrg.create({
    data: userOnOrgInput,
  })
  console.log(
    `Added user of id ${userOnOrg.userId} into organisation of id ${userOnOrg.orgId}`
  )
}

export const readFromExcelandSeedUsers = async (
  excelFile: string,
  userSheetName: string,
  userDataSet: Set<unknown>
) => {
  await readXlsxFile(excelFile, {
    sheet: userSheetName,
    schema: userSchema,
  }).then(async ({ rows, errors }) => {
    if (errors.length !== 0) {
      throw new Error(errors[0].error)
    }
    const casted = rows as Prisma.UserUncheckedCreateInput[]
    for (const row of casted) {
      if (!userDataSet.has(row.name)) {
        userDataSet.add(row.name)
        await addUserToUserTable(row)
      }
    }
  })
}

export const readMain = async (
  excelFile: string,
  mainSheetName: string,
  userDataSet: Set<unknown>
) => {
  return await readXlsxFile(excelFile, {
    sheet: mainSheetName,
    schema: mainSchema,
  }).then(async ({ rows, errors }) => {
    if (errors.length !== 0) {
      throw new Error(errors[0].error)
    }
    const casted: MainSchemaType[] = rows as MainSchemaType[]

    const addUserIfNotAddedAndGetIdOfUser = async (
      userToAdd: Prisma.UserCreateInput
    ): Promise<number> => {
      if (!userDataSet.has(userToAdd.name)) {
        userDataSet.add(userToAdd.name)
        return await addUserToUserTable(userToAdd)
      } else {
        const igHeadUser: User = await prisma.user.findFirstOrThrow({
          where: {
            name: userToAdd.name,
          },
        })
        return igHeadUser.id
      }
    }

    console.log(`Start seeding organisations and userOnOrg...`)
    for (const row of casted) {
      const organisation: Prisma.OrganisationUncheckedCreateInput = {
        id: row.id,
        name: row.name,
        isAdminOrg: row.isAdminOrg === 1,
        category: row.organisationType,
        inviteLink:
          row.inviteOrContactLink || 'https://t.me/' + row.igHeadTeleUsername,
        description: row.description,
        slug: getSlugFromIgName(row.name),
        isInactive: row.isInactive === 1,
        isInvisible: row.isInvisible === 1,
      }

      const orgId = await addOrgToTable(organisation)
      const igHead: Prisma.UserCreateInput = {
        name: row.igHeadFullName,
        telegramUserName: row.igHeadTeleUsername,
      }
      const userId = await addUserIfNotAddedAndGetIdOfUser(igHead)

      await addUserOnOrgToTable(userId, orgId, true)

      const otherUsersNames: string[] = row.otherMembers?.split(';') || []
      const otherUsersTelegramUsernames: string[] =
        row.otherMembersTeleUsername?.split(';') || []
      if (otherUsersTelegramUsernames.length !== otherUsersNames.length) {
        throw new Error(
          `For ${organisation.name} Lengths of otherMembersTeleUsername and otherMembers do not add up`
        )
      }
      const otherUsers: Prisma.UserCreateInput[] = otherUsersNames.map(
        (otherUsersName, index) => {
          return {
            name: otherUsersName,
            telegramUserName: otherUsersTelegramUsernames[index],
          }
        }
      )
      for (const otherUser of otherUsers) {
        const userId = await addUserIfNotAddedAndGetIdOfUser(otherUser)
        await addUserOnOrgToTable(userId, orgId, true)
      }
    }
  })
}

export const readUserOnOrg = async (excelFile: string, sheetname: string) =>
  await readXlsxFile(excelFile, {
    sheet: sheetname,
    schema: userOnOrgSchema,
  }).then(async ({ rows, errors }) => {
    if (errors.length !== 0) {
      throw new Error(errors[0].error)
    }
    const casted: UserOnOrgSchemaType[] = rows as UserOnOrgSchemaType[]
    for (const row of casted) {
      // we don't need to get the id from prisma again, but just to make sure
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: row.userId,
        },
      })
      const org = await prisma.organisation.findUniqueOrThrow({
        where: {
          id: row.orgId,
        },
      })
      await addUserOnOrgToTable(user.id, org.id, row.isIGHead === 1)
    }
  })
