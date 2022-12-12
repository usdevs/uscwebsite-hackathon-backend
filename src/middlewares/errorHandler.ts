import { Request, Response, NextFunction } from 'express'
import { HttpError } from '../types/errors'

/**
 * Custom error handler to standardize error objects returned to
 * the client
 *
 * @param err Error caught by Express.js
 * @param req Request object provided by Express
 * @param res Response object provided by Express
 * @param next NextFunction function provided by Express
 */
function errorHandler(
  err: TypeError | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let customError = err

  if (!(err instanceof HttpError)) {
    customError = new HttpError(
      'Oh no, this is embarrasing. We are having troubles my friend'
    )
  }

  // we are not using the next function to prevent from triggering
  // the default error-handler. However, make sure you are sending a
  // response to client to prevent memory leaks in case you decide to
  // NOT use, like in this example, the NextFunction .i.e., next(new Error())
  res.status((customError as HttpError).status).send(customError)
}

export default errorHandler
