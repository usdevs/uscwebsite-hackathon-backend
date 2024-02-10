import { getBookingById } from '../../services/bookings'
import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import {
  HttpCode,
  HttpException,
  UnauthorizedException,
} from '../../exceptions/'
import { deleteBooking } from '.'
import {
  generateRandomAbility,
  generateRandomBooking,
  generateRandomOrganisation,
  generateRandomRole,
  generateRandomUser,
} from '../../services/test/utils'
import {
  getUserAbilities,
  getUserOrgs,
  getUserRoles,
} from '../../services/users'

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
  getUserRoles: jest.fn(),
  getUserOrgs: jest.fn(),
}))

jest.mock('../../services/bookings', () => ({
  destroyBooking: jest.fn(),
  getBookingById: jest.fn(),
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('Test delete booking handler', () => {
  const memberUser = generateRandomUser({ id: 1 })
  const userWhoMadeBooking = generateRandomUser({ id: 2 })
  const mockBookingId = 123

  const orgId = 1
  const mockBooking = generateRandomBooking({
    id: mockBookingId,
    userId: 2,
    userOrgId: orgId,
  })
  const orgHeadOrg = generateRandomOrganisation({ id: orgId })

  test('Should return 400 if booking id is invalid', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: 'hello' },
    })

    try {
      await deleteBooking(req, res)
    } catch (e) {
      const exception = e as HttpException
      expect(exception).toBeInstanceOf(HttpException)
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Invalid booking id/i)
    }
  })

  // DESCRIBE: Member
  // DESCRIBE: Org Head
  // DESCRIBE: Booking Admin

  test('Should return 401 not authorized if user is not logged in', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      params: { id: mockBookingId.toString() },
    })

    try {
      await deleteBooking(req, res)
    } catch (e) {
      const exception = e as HttpException
      expect(exception).toBeInstanceOf(HttpException)
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/Requires authentication/i)
    }
  })

  test('Should return 401 not authorized if user did not make booking', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: memberUser,
      params: { id: mockBookingId.toString() },
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])
    jest.mocked(getUserRoles).mockResolvedValue([])
    jest.mocked(getBookingById).mockResolvedValue(mockBooking)
    jest.mocked(getUserOrgs).mockResolvedValue([])

    try {
      await deleteBooking(req, res)
    } catch (e) {
      const exception = e as HttpException
      expect(exception).toBeInstanceOf(UnauthorizedException)
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/You are not authorized to/i)
    }
  })

  // TODO: Allow members who book certain places to delete their own booking
  test.todo('Success if member tries to delete their own booking')

  test('Success if org head tries to delete booking in their org', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: userWhoMadeBooking,
      params: { id: mockBookingId.toString() },
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])
    jest
      .mocked(getUserRoles)
      .mockResolvedValue([generateRandomRole(Policy.OrganisationHeadRole)])

    jest.mocked(getBookingById).mockResolvedValue(mockBooking)
    jest.mocked(getUserOrgs).mockResolvedValue([orgHeadOrg])

    await deleteBooking(req, res)
    expect(res.status).toBeCalledWith(HttpCode.OK)
  })

  test('Should return 401 not authorized if org head tries to delete booking in another org', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: userWhoMadeBooking,
      params: { id: mockBookingId.toString() },
    })

    jest.mocked(getUserAbilities).mockResolvedValue([])
    jest
      .mocked(getUserRoles)
      .mockResolvedValue([generateRandomRole(Policy.OrganisationHeadRole)])
    jest.mocked(getBookingById).mockResolvedValue(mockBooking)
    jest
      .mocked(getUserOrgs)
      .mockResolvedValue([generateRandomOrganisation({ id: 3 })])

    try {
      await deleteBooking(req, res)
    } catch (e) {
      const exception = e as HttpException
      expect(exception).toBeInstanceOf(UnauthorizedException)
      expect(exception.status).toBe(HttpCode.Unauthorized)
      expect(exception.message).toMatch(/You are not authorized to/i)
    }
  })

  test('Success if bookingAdmin tries to delete booking', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      user: userWhoMadeBooking,
      params: { id: mockBookingId.toString() },
    })

    jest
      .mocked(getUserAbilities)
      .mockResolvedValue([
        generateRandomAbility(Policy.canDeleteBookingAbility),
      ])
    jest.mocked(getUserRoles).mockResolvedValue([])
    jest.mocked(getBookingById).mockResolvedValue(mockBooking)
    jest.mocked(getUserOrgs).mockResolvedValue([])

    await deleteBooking(req, res)
    expect(res.status).toBeCalledWith(HttpCode.OK)
  })
})
