import { checkStackedBookings } from '../../middlewares/checks'
import { BookingPayload } from '../../services/bookings'
import { AllowIfBookingIsNotStacked } from './stacked'

jest.mock('../../middlewares/checks', () => ({
  checkStackedBookings: jest.fn(),
}))

describe('AllowIfBookingIsNotStacked Policy', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  const mockBooking: BookingPayload = {
    eventName: 'test',
    userId: 1,
    venueId: 1,
    start: new Date(),
    end: new Date(),
    userOrgId: 1,
  }

  test('Should allow if bookings are not stacked', async () => {
    jest.mocked(checkStackedBookings).mockResolvedValue(true)
    const policy = new AllowIfBookingIsNotStacked(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('allow')
  })

  test('Should deny if bookings are stacked', async () => {
    jest.mocked(checkStackedBookings).mockResolvedValue(false)
    const policy = new AllowIfBookingIsNotStacked(mockBooking)
    const decision = await policy.Validate()
    expect(decision).toEqual('deny')
    expect(policy.Reason()).toMatch(
      /Please leave a duration of at least \d+ minutes in between consecutive bookings/
    )
  })
})
