import { Response, Request } from 'express'

export async function deleteBooking(
  req: Request,
  res: Response
): Promise<void> {
  res.send('delete booking!')
}
