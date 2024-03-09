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

// Stylio Submissions
router.get('/stylio/submissions/all', asyncHandler(Controller.listSubmissions))
router.post(
  '/stylio/submissions',
  requiresAuthentication,
  asyncHandler(Controller.createSubmission)
)
router.put(
  '/stylio/submissions/:id',
  requiresAuthentication,
  asyncHandler(Controller.editSubmission)
)
router.delete(
  '/stylio/submissions/:id',
  requiresAuthentication,
  asyncHandler(Controller.handleDeleteSubmission)
)

// Stylio Students
router.get('/stylio/students/all', asyncHandler(Controller.listStudents))
router.post(
  '/stylio/students',
  requiresAuthentication,
  asyncHandler(Controller.createStudent)
)
router.put(
  '/stylio/students/:matriculationNo',
  requiresAuthentication,
  asyncHandler(Controller.editStudent)
)
router.delete(
  '/stylio/students/:matriculationNo',
  requiresAuthentication,
  asyncHandler(Controller.handleDeleteStudent)
)

// Stylio Professors
router.get('/stylio/professors/all', asyncHandler(Controller.listProfessors))
router.post(
  '/stylio/professors',
  requiresAuthentication,
  asyncHandler(Controller.createProfessor)
)
router.put(
  '/stylio/professors/:id',
  requiresAuthentication,
  asyncHandler(Controller.editProfessor)
)
router.delete(
  '/stylio/professors/:id',
  requiresAuthentication,
  asyncHandler(Controller.handleDeleteProfessor)
)

// Stylio Courses
router.get('/stylio/courses/all', asyncHandler(Controller.listCourses))
router.post(
  '/stylio/courses',
  requiresAuthentication,
  asyncHandler(Controller.createCourse)
)
router.put(
  '/stylio/courses/:id',
  requiresAuthentication,
  asyncHandler(Controller.editCourse)
)
router.delete(
  '/stylio/courses/:id',
  requiresAuthentication,
  asyncHandler(Controller.handleDeleteCourse)
)
