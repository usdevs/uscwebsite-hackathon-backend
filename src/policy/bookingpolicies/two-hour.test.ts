import { AllowIfBookingLessThanTwoHours } from './two-hour'
describe('AllowIfBookingLessThanTwoHours policy', () => {
  test('Should allow if booking is less than 2 hours', async () => {
    const mockBooking = {
      eventName: 'test',
      userId: 1,
      venueId: 1,
      start: new Date(),
      end: new Date(Date.now() + 2 * 60 * 60 * 1000 - 1),
      userOrgId: 1,
    }
    const policy = new AllowIfBookingLessThanTwoHours(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('allow')
  })

  test('Should allow if booking is equal to 2 hours', async () => {
    const mockBooking = {
      eventName: 'test',
      userId: 1,
      venueId: 1,
      start: new Date(),
      end: new Date(Date.now() + 2 * 60 * 60 * 1000),
      userOrgId: 1,
    }
    const policy = new AllowIfBookingLessThanTwoHours(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('allow')
  })

  test('Should deny if booking is more than 2 hours', async () => {
    const mockBooking = {
      eventName: 'test',
      userId: 1,
      venueId: 1,
      start: new Date(),
      end: new Date(Date.now() + 2 * 60 * 60 * 1000 + 1),
      userOrgId: 1,
    }
    const policy = new AllowIfBookingLessThanTwoHours(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('deny')
    expect(policy.Reason()).toEqual('Booking duration is longer than 2 hours.')
  })
})
