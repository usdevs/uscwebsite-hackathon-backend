import { Router, Request, Response } from 'express'
import {
    createBooking,
    editBooking,
    deleteBooking,
    getBookings,
} from '../controllers'

export const router: Router = Router()

// landing page
router.get('/', (req: Request, res: Response) => {
  res.send('hi there 👋')
})

// view bookings
router.get('/bookings', getBookings)
// create a booking
router.post('/bookings', createBooking)
// edit a booking
router.patch('/bookings', editBooking)
// delete a booking
router.delete('/bookings', deleteBooking)
