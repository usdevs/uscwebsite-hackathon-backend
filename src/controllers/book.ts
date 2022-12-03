import { Response, Request } from 'express'

export async function createBooking(
    req: Request,
    res: Response
): Promise<void> {
    res.send('create booking!')
}
