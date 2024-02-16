import { AllowIfBookingIsNotTooShort } from './too-short'
import { MIN_SLOTS_PER_BOOKING, DURATION_PER_SLOT } from './../../config/common'
jest.mock('../../config/common', () => ({
  DURATION_PER_SLOT: 30,
  MIN_SLOTS_PER_BOOKING: 3,
}))

describe('AllowIfBookingIsNotTooShort', () => {
  const minDurationInMs = DURATION_PER_SLOT * MIN_SLOTS_PER_BOOKING * 1000 * 60

  test('Should allow if booking is not too short', async () => {
    const mockBooking = {
      eventName: 'test',
      userId: 1,
      venueId: 1,
      start: new Date(),
      end: new Date(Date.now() + minDurationInMs),
      userOrgId: 1,
    }
    const policy = new AllowIfBookingIsNotTooShort(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('allow')
  })

  test('Should deny if booking is too short', async () => {
    const mockBooking = {
      eventName: 'test',
      userId: 1,
      venueId: 1,
      start: new Date(),
      end: new Date(Date.now() + minDurationInMs - 1),
      userOrgId: 1,
    }
    const policy = new AllowIfBookingIsNotTooShort(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('deny')
    expect(policy.Reason()).toEqual(
      'Booking duration is too short, please change your booking request.'
    )
    // Assert that the mocked values are being used
    expect(DURATION_PER_SLOT).toBe(30)
    expect(MIN_SLOTS_PER_BOOKING).toBe(3)
  })
})
