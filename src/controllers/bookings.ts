import { Response, Request, NextFunction } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'

export async function createBooking(
  req: Request,
  res: Response
): Promise<void> {
  res.send('create booking!')
}

export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  next(new HttpException('hello', HttpCode.NotFound))
}

export async function editBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.send('edit booking!')
}

export async function deleteBooking(
  req: Request,
  res: Response
): Promise<void> {
  res.send('delete booking!')
}
