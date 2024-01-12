import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express'
import { requiresAuthentication } from '@middlewares/auth.middleware'
import * as Controller from '@/controllers'

export const router: Router = Router()

// We need this as Express does not automatically bubble up errors thrown in handlers
const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next)
  }

// login route
router.post('/login', asyncHandler(Controller.handleLogin))

// get description of all Organisations
// authentication not needed
router.get('/orgs', asyncHandler(Controller.listOrgs))
router.get('/orgs/categories', asyncHandler(Controller.listOrgCategories))

// create or edit an organisation
router.put(
  '/org/:id',
  requiresAuthentication,
  asyncHandler(Controller.editOrganisation)
)
// delete an organisation
router.delete(
  '/org/:id',
  requiresAuthentication,
  asyncHandler(Controller.deleteOrganisation)
)

// get all venues
router.get('/venues', asyncHandler(Controller.listVenue))

// get all users
router.get('/users', requiresAuthentication, asyncHandler(Controller.listUser))

// create a user
router.post(
  '/user',
  requiresAuthentication,
  asyncHandler(Controller.createUser)
)
// edit a user
router.put(
  '/user/:id',
  requiresAuthentication,
  asyncHandler(Controller.editUser)
)
// delete a user
router.delete(
  '/user/:id',
  requiresAuthentication,
  asyncHandler(Controller.deleteUser)
)

// create a booking
router.post(
  '/bookings',
  requiresAuthentication,
  asyncHandler(Controller.createBooking)
)
// view all bookings
router.get('/bookings/all', asyncHandler(Controller.listBookings))
// view bookings
router.get('/bookings', asyncHandler(Controller.getUserBookingsController))
// edit a booking
router.put(
  '/bookings/:id',
  requiresAuthentication,
  asyncHandler(Controller.editBooking)
)
// delete a booking
router.delete(
  '/bookings/:id',
  requiresAuthentication,
  asyncHandler(Controller.deleteBooking)
)
