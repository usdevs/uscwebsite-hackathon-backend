import { HttpCode, HttpException } from '@/exceptions/HttpException'
import { checkSignature, generateToken } from '@middlewares/auth.middleware'
import { Prisma, Role } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { prisma } from '../../../db'

import { AcadsAdminRole, BookingAdminRole, WebsiteAdminRole } from '@/policy'
import { getUserRoles } from '@/services/users'
import { getAllVenues, getVenueRoles } from '@/services/venues'
import { TelegramAuthSchema } from '@interfaces/auth.interface'

const NO_MATCHING_USER_MESSAGE = `You are not authorized to access the NUSC website!
Note: this may be an issue if you have recently changed your Telegram username without actually having logged into the NUSC website.
If so, please add your new username via the Admin tab.`

const MULTIPLE_MATCHING_USERS_MESSAGE = `Multiple database entries for the same telegramId or the same telegramUserName detected!
  Contact the website admin to ensure there is only one.`

async function generatePermissions(userId: number): Promise<{
  isAdmin: boolean
}> {
  const roleNames = (await getUserRoles(userId)).map((role) => role.name)
  console.log(roleNames)

  const roleNamesSet = new Set(roleNames)
  const allVenues = await getAllVenues()

  // Set the permission for various tasks for frontend to use
  const isAdmin: boolean = roleNames.includes(WebsiteAdminRole.name)
  const isBookingAdmin = isAdmin || roleNames.includes(BookingAdminRole.name)
  const isAcadsAdmin = isAdmin || roleNames.includes(AcadsAdminRole.name)

  // Create a map of venue name to whether the user is an admin for that venue
  const venueRoles: Array<[number, Role[]]> = await Promise.all(
    allVenues.map(async (venue) => [venue.id, await getVenueRoles(venue.id)])
  )
  const venueIsVenueAdmin: Array<[number, boolean]> = venueRoles.map(
    ([venueId, roles]) => [
      venueId,
      isAdmin ||
        isBookingAdmin ||
        roles.some((role) => roleNamesSet.has(role.name)),
    ]
  )

  const venueIdToIsVenueAdmin: Record<string, boolean> =
    Object.fromEntries(venueIsVenueAdmin)

  const permissions = {
    isAdmin,
    isAcadsAdmin,
    venueIdToIsVenueAdmin,
  }

  return permissions
}

export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userCredentials = TelegramAuthSchema.parse(req.body)

  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    console.log('Running in development mode, skipping signature checks...')
    console.log('User credentials:', userCredentials)
  }

  if (!isDev && !checkSignature(process.env.BOT_TOKEN || '', userCredentials)) {
    next(
      new HttpException(
        'Failed to check user credentials against those obtained from the bot!',
        HttpCode.Unauthorized
      )
    )
    return
  }

  let userId = 0
  const users = prisma.user

  const input: Prisma.UserWhereInput[] = isDev
    ? [
        // In development, we don't have the telegramId
        {
          telegramUserName: userCredentials.username,
        },
      ]
    : [
        {
          telegramId: userCredentials.id,
        },
        {
          telegramId: null,
          telegramUserName: userCredentials.username,
        },
      ]

  const args: Prisma.UserFindManyArgs = {
    where: {
      OR: input,
    },
    orderBy: {
      telegramId: { sort: 'asc', nulls: 'last' },
    },
  }
  const matchingUsersPromise: Promise<
    Prisma.UserGetPayload<Prisma.UserFindManyArgs>[]
  > = users.findMany(args)
  const matchingUsers: Prisma.UserGetPayload<Prisma.UserFindManyArgs>[] =
    await matchingUsersPromise

  if (matchingUsers.length === 0) {
    console.error(input)
    throw new HttpException(NO_MATCHING_USER_MESSAGE, HttpCode.Unauthorized)
  } else if (matchingUsers.length > 1) {
    console.error(matchingUsers)
    throw new HttpException(
      MULTIPLE_MATCHING_USERS_MESSAGE,
      HttpCode.InternalServerError
    )
  } else {
    // Update telegram details in the database
    // When the user was initially created, we did not have their telegramId
    const user = matchingUsers[0]
    userId = user.id
    let name = `${userCredentials.first_name}`
    // because last name is optional on Tele
    if (userCredentials.last_name) {
      name = name + `${userCredentials.last_name}`
    }

    await users.update({
      where: { id: user.id },
      data: {
        name: name,
        telegramId: userCredentials.id,
        telegramUserName: userCredentials.username,
      },
    })
  }

  const userOrgs = await prisma.userOnOrg.findMany({
    where: {
      userId: userId,
    },
    include: {
      org: {
        select: {
          isAdminOrg: true,
        },
      },
    },
  })

  const orgIds = userOrgs.map((userOrg) => userOrg.orgId)
  const token = generateToken(userCredentials)

  const permissions = await generatePermissions(userId)

  res.status(200).send({ userCredentials, token, orgIds, userId, permissions })
}
