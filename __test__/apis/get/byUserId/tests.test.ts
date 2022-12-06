import getBookingFromPrismaByUserId from '../../../../src/apis/get/byUserId'

test('should get more than 0 existing Booking with matching userId', async () => {
  await expect(getBookingFromPrismaByUserId(1)).resolves.not.toHaveLength(0)
})

test('should not receive any result', async () => {
  await expect(getBookingFromPrismaByUserId(-1)).resolves.toHaveLength(0)
})
