import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express'
import { handleLogin } from '../controllers/login'
import { requiresAuthentication } from '@middlewares/auth.middleware'
import {
  getBookings,
  createBooking,
  editBooking,
  deleteBookingHandler,
} from '../controllers/bookings'
import { getOrgs } from '@/controllers/organisation'

export const router: Router = Router()

// We need this as Express does not automatically bubble up errors thrown in handlers
const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next)
  }

// login route
router.post('/login', asyncHandler(handleLogin))

// get description of all Organisations
// authentication not needed
router.get('/orgs', asyncHandler(getOrgs))

// create a booking
router.post('/bookings', requiresAuthentication, asyncHandler(createBooking))
// view bookings
router.get('/bookings', asyncHandler(getBookings))
// edit a booking
router.put('/bookings/:id', requiresAuthentication, asyncHandler(editBooking))
// delete a booking
router.delete(
  '/bookings/:id',
  requiresAuthentication,
  asyncHandler(deleteBookingHandler)
)
