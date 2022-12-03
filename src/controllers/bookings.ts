import { Response, Request } from 'express'

export async function getBookings(req: Request, res: Response): Promise<void> {
    res.send('view bookings!')
}
