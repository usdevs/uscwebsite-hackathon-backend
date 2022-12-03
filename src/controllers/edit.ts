import { Response, Request } from 'express'

export async function editBooking(req: Request, res: Response): Promise<void> {
    res.send('edit booking!')
}
