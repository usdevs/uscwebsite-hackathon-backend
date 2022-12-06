import getBookingFromPrismaByBookingId from '../../../../src/apis/get/byBookingId'

// this test case might break when used together with the delete test case
// since delete removes bookings which makes the hardcoded id difficult to match
test('should get more than 0 existing Booking with matching userId', async () => {
  await expect(getBookingFromPrismaByBookingId(22)).resolves.not.toBe(null)
})

test('should not receive any result', async () => {
  await expect(getBookingFromPrismaByBookingId(-1)).resolves.toBe(null)
})
