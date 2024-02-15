import { BookingPayload } from '../../services/bookings'
import { AllowIfBookingWithin14Days } from '../bookingpolicies/advance'

describe('AllowIfBookingWithin14Days Policy', () => {
  const now = new Date()
  const fifteenDaysInFuture = new Date()
  fifteenDaysInFuture.setDate(now.getDate() + 15)

  let mockBooking: BookingPayload = {
    eventName: 'test',
    userId: 1,
    venueId: 1,
    start: fifteenDaysInFuture,
    end: fifteenDaysInFuture,
    userOrgId: 1,
  }

  test('should deny if booking is more than  14 days in the future', async () => {
    const policy = new AllowIfBookingWithin14Days(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('deny')
    expect(policy.Reason()).toEqual(
      'You can only book up to 14 days in advance'
    )
  })

  test('should allow if booking is within  14 days', async () => {
    const thirteenDaysInFuture = new Date()
    thirteenDaysInFuture.setDate(now.getDate() + 13)
    mockBooking.start = thirteenDaysInFuture
    mockBooking.end = thirteenDaysInFuture
    const policy = new AllowIfBookingWithin14Days(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('allow')
  })
})
