import { Router, Request, Response } from 'express'
import { handleLogin } from '../controllers/login'
import { authenticate } from '@middlewares/auth.middleware'
import { Validator } from 'express-json-validator-middleware'
import {
  getBookings,
  createBooking,
  editBooking,
  deleteBooking,
} from '../controllers/bookings'
import { telegramAuthSchema } from '@interfaces/auth.interface'

export const router: Router = Router()
const { validate } = new Validator()

// landing page
router.get('/', (req: Request, res: Response) => {
  res.send('hi there 👋')
})
// create a booking
router.post('/bookings', authenticate, createBooking)
// view bookings
router.get('/bookings', getBookings)
// edit a booking
router.put('/bookings', authenticate, editBooking)
// delete a booking
router.delete('/bookings', authenticate, deleteBooking)
// login route
router.post('/login', validate({ body: telegramAuthSchema }), handleLogin)
