import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import { UnauthorizedException } from '../../exceptions/'
import {
  getUserAbilities,
  getUserOrgs,
  getUserRoles,
} from '../../services/users'
import {
  generateRandomAbility,
  generateRandomBooking,
  generateRandomOrganisation,
  generateRandomRole,
  generateRandomUser,
  generateRandomVenue,
} from '../../services/test/utils'
import { addBooking } from '../../services/bookings'
import { checkStackedBookings } from '../../middlewares/checks'
import { createBooking } from '.'

jest.mock('../../middlewares/checks', () => ({
  checkStackedBookings: jest.fn(),
}))

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
  getUserRoles: jest.fn(),
  getUserOrgs: jest.fn(),
}))

jest.mock('../../services/bookings', () => ({
  addBooking: jest.fn(),
}))

beforeEach(() => {
  jest.mocked(addBooking).mockResolvedValue(generateRandomBooking({}))
  jest.mocked(checkStackedBookings).mockResolvedValue(true)
})

afterEach(async () => {
  jest.resetAllMocks()
})

// We are just trying to test the policy here, so we don't need to test the actual booking creation
// or the service layer
describe('Test create booking handler', () => {
  const bookingAdmin = generateRandomUser()
  const orgHeadUser = generateRandomUser()
  const memberUser = generateRandomUser()
  const bookingAdminOrg = generateRandomOrganisation()
  const orgHeadOrg = generateRandomOrganisation()
  const memberOrg = generateRandomOrganisation()
  const venue = generateRandomVenue()

  const thirtyMinutesLater = new Date()
  thirtyMinutesLater.setMinutes(thirtyMinutesLater.getMinutes() + 30)
  const oneHourLater = new Date()
  oneHourLater.setHours(oneHourLater.getHours() + 1)

  test('Should return 401 if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: {
        start: thirtyMinutesLater,
        end: oneHourLater,
        eventName: 'test',
        venueId: venue.id,
        userId: memberUser.id,
        userOrgId: memberOrg.id,
        orgId: memberOrg.id,
      },
    })

    await expect(createBooking(req, res)).rejects.toBeInstanceOf(
      UnauthorizedException
    )
  })

  test('Should return 401 not authorized', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      user: memberUser,
      body: {
        start: thirtyMinutesLater,
        end: oneHourLater,
        eventName: 'test',
        venueId: venue.id,
        userId: memberUser.id,
        userOrgId: memberOrg.id,
        orgId: memberOrg.id,
      },
    })

    // A member role should have no abilities with regards to booking module
    jest.mocked(getUserAbilities).mockResolvedValue([])
    jest.mocked(getUserRoles).mockResolvedValue([])

    await expect(createBooking(req, res)).rejects.toBeInstanceOf(
      UnauthorizedException
    )
  })

  test('Should return 401 if orgHead book for other orgs', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      user: {
        id: orgHeadUser.id,
      },
      body: {
        start: thirtyMinutesLater,
        end: oneHourLater,
        eventName: 'test',
        venueId: venue.id,
        userId: orgHeadUser.id,
        orgId: memberOrg.id,
      },
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])
    jest
      .mocked(getUserRoles)
      .mockResolvedValue([generateRandomRole(Policy.OrganisationHeadRole)])
    jest.mocked(getUserOrgs).mockResolvedValue([orgHeadOrg])

    await expect(createBooking(req, res)).rejects.toBeInstanceOf(
      UnauthorizedException
    )
  })

  test('Success if orgHead book for their own org', async () => {
    const { res } = getMockRes({
      status: jest.fn().mockReturnThis(),
    })
    const req = getMockReq({
      user: {
        id: orgHeadUser.id,
      },
      body: {
        start: thirtyMinutesLater,
        end: oneHourLater,
        eventName: 'test',
        venueId: venue.id,
        userId: orgHeadUser.id,
        userOrgId: orgHeadOrg.id,
        orgId: orgHeadOrg.id,
      },
    })

    // A member role should have no abilities with regards to booking module
    jest.mocked(getUserAbilities).mockResolvedValue([])
    jest
      .mocked(getUserRoles)
      .mockResolvedValue([generateRandomRole(Policy.OrganisationHeadRole)])
    jest.mocked(getUserOrgs).mockResolvedValue([orgHeadOrg])

    await createBooking(req, res).catch((e) => console.log(e))
    expect(res.status).toBeCalledWith(200)
  })

  test('Success if bookingAdmin book for other orgs', async () => {
    const { res } = getMockRes({
      status: jest.fn().mockReturnThis(),
    })

    const req = getMockReq({
      user: {
        id: bookingAdmin.id,
      },
      body: {
        start: thirtyMinutesLater,
        end: oneHourLater,
        eventName: 'test',
        venueId: venue.id,
        userId: bookingAdmin.id,
        userOrgId: bookingAdminOrg.id,
        orgId: orgHeadOrg.id,
      },
    })

    // bookingAdmin has the can create booking ability
    jest
      .mocked(getUserAbilities)
      .mockResolvedValue([
        generateRandomAbility(Policy.canCreateBookingAbility),
      ])

    await createBooking(req, res)
    expect(res.status).toBeCalledWith(200)
  })
})
