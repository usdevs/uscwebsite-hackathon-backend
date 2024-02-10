import { updateBooking } from '../../services/bookings'
import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { RequestWithUser } from '../../interfaces/auth.interface'
import {
  HttpCode,
  HttpException,
  UnauthorizedException,
} from '../../exceptions/'
import { editBooking } from '.'
import {
  generateRandomAbility,
  generateRandomBooking,
  generateRandomOrganisation,
  generateRandomRole,
  generateRandomUser,
  generateRandomVenue,
} from '../../services/test/utils'
import {
  getUserAbilities,
  getUserOrgs,
  getUserRoles,
} from '../../services/users'
import { checkStackedBookings } from '../../middlewares/checks'

jest.mock('../../middlewares/checks', () => ({
  checkStackedBookings: jest.fn(),
}))

jest.mock('../../services/users', () => ({
  getUserAbilities: jest.fn(),
  getUserRoles: jest.fn(),
  getUserOrgs: jest.fn(),
}))

jest.mock('../../services/bookings', () => ({
  updateBooking: jest.fn(),
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('editBooking', () => {
  const bookingAdmin = generateRandomUser()
  const memberUser = generateRandomUser({ id: 1 })
  const bookingAdminOrg = generateRandomOrganisation()
  const memberOrg = generateRandomOrganisation({ id: 1 })
  const venue = generateRandomVenue()

  const thirtyMinutesLater = new Date()
  thirtyMinutesLater.setMinutes(thirtyMinutesLater.getMinutes() + 30)
  const oneHourLater = new Date()
  oneHourLater.setHours(oneHourLater.getHours() + 1)

  const bookingBody = {
    start: thirtyMinutesLater,
    end: oneHourLater,
    eventName: 'test',
    venueId: venue.id,
    userId: memberUser.id,
    userOrgId: memberOrg.id,
    orgId: memberOrg.id,
  }

  test('Should throw HttpException if booking id is invalid number', async () => {
    const { res } = getMockRes()
    const req = getMockReq<RequestWithUser>({
      body: {
        ...bookingBody,
      },
      params: {
        id: 'invalid',
      },
    })

    try {
      await editBooking(req, res)
      throw new Error('Should not reach here')
    } catch (e) {
      const exception = e as HttpException
      expect(exception).toBeInstanceOf(HttpException)
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Invalid booking id/i)
    }
  })

  describe('User is not logged in', () => {
    test('Should throw UnauthorizedException', async () => {
      const { res } = getMockRes()
      const req = getMockReq<RequestWithUser>({
        body: {
          ...bookingBody,
        },
        params: {
          id: '1',
        },
      })

      try {
        await editBooking(req, res)
        throw new Error('Should not reach here')
      } catch (e) {
        const exception = e as HttpException
        expect(exception).toBeInstanceOf(HttpException)
        expect(exception.status).toBe(HttpCode.Unauthorized)
        expect(exception.message).toMatch(/Requires authentication/i)
      }
    })
  })

  // TODO: Handle case for allowing random people to book
  describe('User is member', () => {
    test('Should throw UnauthorizedException', async () => {
      const { res } = getMockRes()

      const req = getMockReq<RequestWithUser>({
        user: memberUser,
        body: {
          ...bookingBody,
        },
        params: {
          id: '1',
        },
      })

      // A member role should have no abilities with regards to booking module
      jest.mocked(getUserAbilities).mockResolvedValue([])
      jest.mocked(getUserRoles).mockResolvedValue([])
      jest.mocked(getUserOrgs).mockResolvedValue([])

      try {
        await editBooking(req, res)
        throw new Error('Should not reach here')
      } catch (e) {
        const exception = e as UnauthorizedException
        expect(exception).toBeInstanceOf(UnauthorizedException)
        expect(exception.status).toBe(HttpCode.Unauthorized)
        expect(exception.message).toMatch(
          /You are not authorized .* canUpdateBooking/i
        )
      }
    })
  })

  describe('User is org head', () => {
    test('Should throw UnauthorizedException if edit other org booking', async () => {
      const { res } = getMockRes()

      const req = getMockReq<RequestWithUser>({
        user: memberUser,
        body: {
          ...bookingBody,
        },
        params: {
          id: '1',
        },
      })

      jest.mocked(getUserAbilities).mockResolvedValue([])
      jest
        .mocked(getUserRoles)
        .mockResolvedValue([generateRandomRole(Policy.OrganisationHeadRole)])

      // Generate random org that the user is not a head of
      jest
        .mocked(getUserOrgs)
        .mockResolvedValue([generateRandomOrganisation({ id: 200 })])

      try {
        await editBooking(req, res)
        throw new Error('Should not reach here')
      } catch (e) {
        const exception = e as UnauthorizedException
        expect(exception).toBeInstanceOf(UnauthorizedException)
        expect(exception.status).toBe(HttpCode.Unauthorized)
        expect(exception.message).toMatch(
          /You are not authorized .* canUpdateBooking/i
        )
      }
    })

    test('Should throw HttpException if booking does not exist', async () => {
      const { res } = getMockRes()

      const req = getMockReq<RequestWithUser>({
        user: memberUser,
        body: {
          ...bookingBody,
        },
        params: {
          id: '1',
        },
      })

      jest.mocked(getUserAbilities).mockResolvedValue([])
      jest
        .mocked(getUserRoles)
        .mockResolvedValue([generateRandomRole(Policy.OrganisationHeadRole)])
      jest.mocked(getUserOrgs).mockResolvedValue([memberOrg])

      jest.mocked(checkStackedBookings).mockResolvedValue(true)

      // Mock that the booking does not exist
      const errorMessage = `Could not find booking with id 1`
      jest
        .mocked(updateBooking)
        .mockRejectedValue(new HttpException(errorMessage, HttpCode.BadRequest))

      try {
        await editBooking(req, res)
        throw new Error('Should not reach here')
      } catch (e) {
        console.log(e)
        expect(e).toBeInstanceOf(HttpException)
        const exception = e as HttpException
        expect(exception.status).toBe(HttpCode.BadRequest)
        expect(exception.message).toMatch(errorMessage)
      }
    })

    test('Should successfully update own org booking', async () => {
      const { res } = getMockRes()

      const req = getMockReq<RequestWithUser>({
        user: memberUser,
        body: {
          ...bookingBody,
        },
        params: {
          id: '1',
        },
      })

      jest.mocked(getUserAbilities).mockResolvedValue([])
      jest
        .mocked(getUserRoles)
        .mockResolvedValue([generateRandomRole(Policy.OrganisationHeadRole)])
      jest.mocked(getUserOrgs).mockResolvedValue([memberOrg])

      jest.mocked(checkStackedBookings).mockResolvedValue(true)

      const mockBooking = generateRandomBooking({
        id: 1,
        userId: memberUser.id,
      })
      jest.mocked(updateBooking).mockResolvedValue(mockBooking)

      await editBooking(req, res)
      expect(res.json).toBeCalledWith({ result: [mockBooking] })
    })
  })

  describe('User is admin', () => {
    test('Should successfully update booking', async () => {
      const { res } = getMockRes()

      const req = getMockReq<RequestWithUser>({
        user: memberUser,
        body: {
          ...bookingBody,
        },
        params: {
          id: '1',
        },
      })

      jest
        .mocked(getUserAbilities)
        .mockResolvedValue([
          generateRandomAbility(Policy.canUpdateBookingAbility),
        ])
      jest.mocked(getUserRoles).mockResolvedValue([])
      jest.mocked(getUserOrgs).mockResolvedValue([])
      jest.mocked(checkStackedBookings).mockResolvedValue(true)

      const mockBooking = generateRandomBooking({
        id: 1,
        userId: memberUser.id,
      })
      jest.mocked(updateBooking).mockResolvedValue(mockBooking)

      await editBooking(req, res)
      expect(res.json).toBeCalledWith({ result: [mockBooking] })
    })
  })
})
