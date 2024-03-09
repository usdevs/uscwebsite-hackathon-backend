import { BookingPayload } from '../../services/bookings'
import { generateRandomUser } from '../../services/test/utils'
import { AllowIfBookingBelongToUser } from './belong'

describe('AllowIfBookingBelongToUser Policy', () => {
  const user = generateRandomUser({ id: 1 })
  const mockBooking: BookingPayload = {
    eventName: 'test',
    userId: 1,
    venueId: 1,
    start: new Date(),
    end: new Date(),
    userOrgId: 1,
  }

  test('Should allow if booking belongs to user', async () => {
    const policy = new AllowIfBookingBelongToUser(mockBooking, user)
    const decision = await policy.Validate()
    expect(decision).toEqual('allow')
  })

  test('Should deny if booking does not belong to user', async () => {
    const policy = new AllowIfBookingBelongToUser(
      mockBooking,
      generateRandomUser({ id: 2 })
    )
    const decision = await policy.Validate()
    expect(decision).toEqual('deny')
    expect(policy.Reason()).toEqual('This booking does not belong to you.')
  })
})
