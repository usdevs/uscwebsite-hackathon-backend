import { DURATION_PER_SLOT, MAX_SLOTS_PER_BOOKING } from './../../config/common'
import { AllowIfBookingIsNotTooLong } from './too-long'

jest.mock('../../config/common', () => ({
  DURATION_PER_SLOT: 30,
  MAX_SLOTS_PER_BOOKING: 3,
}))

describe('AllowIfBookingIsNotTooLong Policy', () => {
  const maxDurationInMs = DURATION_PER_SLOT * MAX_SLOTS_PER_BOOKING * 1000 * 60

  test('Should allow if booking is not too long', async () => {
    const mockBooking = {
      eventName: 'test',
      userId: 1,
      venueId: 1,
      start: new Date(),
      end: new Date(Date.now() + maxDurationInMs),
      userOrgId: 1,
    }
    const policy = new AllowIfBookingIsNotTooLong(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('allow')
  })

  test('Should deny if booking is too long', async () => {
    const mockBooking = {
      eventName: 'test',
      userId: 1,
      venueId: 1,
      start: new Date(),
      end: new Date(Date.now() + maxDurationInMs + 1),
      userOrgId: 1,
    }
    const policy = new AllowIfBookingIsNotTooLong(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('deny')
    expect(policy.Reason()).toEqual(
      'Booking duration is too long, please change your booking request.'
    )
    // Assert that the mocked values are being used
    expect(DURATION_PER_SLOT).toBe(30)
    expect(MAX_SLOTS_PER_BOOKING).toBe(3)
  })
})
