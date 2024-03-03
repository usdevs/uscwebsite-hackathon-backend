import { getVenueRoles } from './../../services/venues'
import * as Policy from '../../policy'
import { AllowIfAdminForVenue } from './venue-admin'
import { BookingPayload } from '../../services/bookings'
import {
  generateRandomRole,
  generateRandomUser,
} from '../../services/test/utils'
import { getUserRoles } from '../../services/users'

jest.mock('../../services/users', () => ({
  getUserRoles: jest.fn(),
}))

jest.mock('../../services/venues', () => ({
  getVenueRoles: jest.fn(),
}))

describe('AllowIfAdminForVenue Policy', () => {
  const user = generateRandomUser({ id: 1 })
  const mockRole = generateRandomRole(Policy.MemberRole)
  const mockBooking: BookingPayload = {
    eventName: 'test',
    userId: 1,
    venueId: 1,
    start: new Date(),
    end: new Date(),
    userOrgId: 1,
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should deny if user is not logged in', async () => {
    const policy = new AllowIfAdminForVenue(mockBooking)
    const result = await policy.Validate()

    expect(result).toEqual('deny')
    expect(policy.Reason()).toEqual('User is not logged in')
  })

  test('Should allow if user has specified role for venue', async () => {
    const policy = new AllowIfAdminForVenue(mockBooking)
    jest.mocked(getUserRoles).mockResolvedValue([mockRole])
    jest.mocked(getVenueRoles).mockResolvedValue([mockRole])

    const decision = await policy.Validate(user)
    expect(getUserRoles).toHaveBeenCalledWith(user.id)
    expect(getVenueRoles).toHaveBeenCalledWith(mockBooking.venueId)

    expect(decision).toEqual('allow')
  })

  test('Should deny if user lacks the specified role', async () => {
    const policy = new AllowIfAdminForVenue(mockBooking)
    jest
      .mocked(getUserRoles)
      .mockResolvedValue([generateRandomRole(Policy.SpacesAdminRole)])
    jest.mocked(getVenueRoles).mockResolvedValue([mockRole])

    const decision = await policy.Validate(user)
    expect(getUserRoles).toHaveBeenCalledWith(user.id)
    expect(getVenueRoles).toHaveBeenCalledWith(mockBooking.venueId)

    expect(decision).toEqual('deny')
    expect(policy.Reason()).toEqual(
      `User does not have any of the following roles: ${mockRole.name}`
    )
  })
})
