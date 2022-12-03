import { Router, Request, Response } from 'express'
import { createBooking } from '../controllers/book'

export const router: Router = Router()

// landing page
router.get('/', (req: Request, res: Response) => {
  res.send('hi there 👋')
})
// create a booking
router.post('/book', createBooking)
// view bookings
router.get('/bookings')
// edit a booking
router.patch('/edit')
// delete a booking
router.patch('/delete')
