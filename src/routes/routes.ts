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

// Folio Submissions
router.get('/folio/submissions/all', asyncHandler(Controller.listSubmissions))
router.post(
  '/folio/submissions',
  requiresAuthentication,
  asyncHandler(Controller.createSubmission)
)
router.put(
  '/folio/submissions/:id',
  requiresAuthentication,
  asyncHandler(Controller.editSubmission)
)
router.delete(
  '/folio/submissions/:id',
  requiresAuthentication,
  asyncHandler(Controller.handleDeleteSubmission)
)

// Folio Students
router.get('/folio/students/all', asyncHandler(Controller.listStudents))
router.post(
  '/folio/students',
  requiresAuthentication,
  asyncHandler(Controller.createStudent)
)
router.put(
  '/folio/students/:matriculationNo',
  requiresAuthentication,
  asyncHandler(Controller.editStudent)
)
router.delete(
  '/folio/students/:matriculationNo',
  requiresAuthentication,
  asyncHandler(Controller.handleDeleteStudent)
)

// Folio Professors
router.get('/folio/professors/all', asyncHandler(Controller.listProfessors))
router.post(
  '/folio/professors',
  requiresAuthentication,
  asyncHandler(Controller.createProfessor)
)
router.put(
  '/folio/professors/:id',
  requiresAuthentication,
  asyncHandler(Controller.editProfessor)
)
router.delete(
  '/folio/professors/:id',
  requiresAuthentication,
  asyncHandler(Controller.handleDeleteProfessor)
)

// Folio Courses
router.get('/folio/courses/all', asyncHandler(Controller.listCourses))
router.post(
  '/folio/courses',
  requiresAuthentication,
  asyncHandler(Controller.createCourse)
)
router.put(
  '/folio/courses/:id',
  requiresAuthentication,
  asyncHandler(Controller.editCourse)
)
router.delete(
  '/folio/courses/:id',
  requiresAuthentication,
  asyncHandler(Controller.handleDeleteCourse)
)
