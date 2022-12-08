import { Router, Request, Response } from 'express'
import { createBooking } from '../controllers/book'
import { handleLogin } from '../controllers/login'
import { authenticate } from '../middlewares/auth'
import bodyParser from 'body-parser'
import { getBookings } from '../controllers/bookings'
import { editBooking } from '../controllers/edit'
import { deleteBooking } from '../controllers/delete'

export const router: Router = Router()

// landing page
router.get('/', (req: Request, res: Response) => {
  res.send('hi there 👋')
})
// create a booking
router.post('/book', authenticate, createBooking)
// view bookings
router.get('/bookings', getBookings)
// edit a booking
router.patch('/edit', authenticate, editBooking)
// delete a booking
router.patch('/delete', authenticate, deleteBooking)
// login route
router.post('/login', bodyParser.json(), handleLogin)
