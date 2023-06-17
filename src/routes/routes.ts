import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express'
import { handleLogin } from '@controllers/login'
import { requiresAuthentication } from '@middlewares/auth.middleware'
import {
  getAllBookingsController,
  getUserBookingsController,
  createBooking,
  editBooking,
  deleteBookingHandler,
} from '@controllers/bookings'
import { getOrgCategories, getOrgs } from "@/controllers/organisation";
import { getVenues } from "@controllers/venues";

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
router.get('/orgs/categories', asyncHandler(getOrgCategories))

router.get('/venues', asyncHandler(getVenues))

// create a booking
router.post('/bookings', requiresAuthentication, asyncHandler(createBooking))
// view all bookings
router.get('/bookings/all', getAllBookingsController)
// view bookings
router.get('/bookings', asyncHandler(getUserBookingsController))
// edit a booking
router.put('/bookings/:id', requiresAuthentication, asyncHandler(editBooking))
// delete a booking
router.delete(
  '/bookings/:id',
  requiresAuthentication,
  asyncHandler(deleteBookingHandler)
)
