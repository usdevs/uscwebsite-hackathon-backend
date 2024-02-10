import { Request, Response } from 'express'
import { HttpCode, HttpException } from '../../exceptions/HttpException'
import { listBookings, getUserBookingsController } from './list'
import { getMockReq, getMockRes } from '@jest-mock/express'
import * as Policy from '../../policy'
import { generateRandomBooking } from '../../services/test/utils'
import { getAllBookings, getUserBookings } from '../../services/bookings'

jest.mock('../../services/bookings', () => ({
  getUserBookings: jest.fn(),
  getAllBookings: jest.fn(),
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('listBookings', () => {
  const mockStartDate = '2024-02-10T00:00:00Z'
  const mockEndDate = '2024-02-11T00:00:00Z'

  test('Should throw HttpException if start date is invalid', async () => {
    const { res } = getMockRes()
    const req = getMockReq<Request>({
      query: { start: 'hello', end: mockEndDate },
    })

    try {
      await listBookings(req, res)
    } catch (e) {
      const exception = e as HttpException
      expect(exception).toBeInstanceOf(HttpException)
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(
        /Query start is not a valid date string/i
      )
    }
  })

  test('Should throw HttpException if end date is invalid', async () => {
    const { res } = getMockRes()
    const req = getMockReq<Request>({
      query: { start: mockStartDate, end: 'hello' },
    })

    try {
      await listBookings(req, res)
    } catch (e) {
      const exception = e as HttpException
      expect(exception).toBeInstanceOf(HttpException)
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Query end is not a valid date string/i)
    }
  })

  describe('Not a user', () => {
    test('Should return bookings within the given date range if date range is valid', async () => {
      const { res } = getMockRes()
      const req = getMockReq<Request>({
        query: { start: mockStartDate, end: mockEndDate },
      })

      const mockBookings = [generateRandomBooking(), generateRandomBooking()]
      jest.mocked(getAllBookings).mockResolvedValue(mockBookings)

      await listBookings(req, res)

      expect(res.json).toHaveBeenCalledWith(mockBookings)
    })
  })
})

describe('getUserBookingsController', () => {
  test('Should throw HttpException if userId is missing', async () => {
    const { res } = getMockRes()
    const req = getMockReq<Request>({
      query: {},
    })

    try {
      await getUserBookingsController(req, res)
    } catch (e) {
      const exception = e as HttpException
      expect(exception).toBeInstanceOf(HttpException)
      expect(exception.status).toBe(HttpCode.BadRequest)
      expect(exception.message).toMatch(/Query missing userId/i)
    }
  })

  test('should return user bookings when userId is provided', async () => {
    const { res } = getMockRes()
    const req = getMockReq<Request>({
      query: { userId: '1' },
    })

    // Mock the behavior of the getUserBookings service
    const mockBookings = [generateRandomBooking(), generateRandomBooking()]
    jest.mocked(getUserBookings).mockResolvedValue(mockBookings)

    await getUserBookingsController(req, res)

    expect(getUserBookings).toHaveBeenCalledWith(1)
    expect(res.json).toHaveBeenCalledWith(mockBookings)
  })
})
