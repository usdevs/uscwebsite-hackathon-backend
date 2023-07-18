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
import {
  createOrganisation,
  deleteOrganisation,
  editOrganisation,
  getOrgCategories,
  getOrgs
} from "@controllers/organisations";
import { getVenues } from "@controllers/venues";
import { createUser, deleteUserFromDb, editUser, getUsers } from "@controllers/users";

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

// create an organisation
router.post('/org', requiresAuthentication, asyncHandler(createOrganisation))
// edit an organisation
router.put('/org/:id', requiresAuthentication, asyncHandler(editOrganisation))
// delete an organisation
router.delete('/org/:id', requiresAuthentication, asyncHandler(deleteOrganisation))

// get all venues
router.get('/venues', asyncHandler(getVenues))

// get all users
router.get('/users', requiresAuthentication, asyncHandler(getUsers))

// create a user
router.post('/user', requiresAuthentication, asyncHandler(createUser))
// edit a user
router.put('/user/:id', requiresAuthentication, asyncHandler(editUser))
// delete a user
router.delete('/user/:id', requiresAuthentication, asyncHandler(deleteUserFromDb))

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
