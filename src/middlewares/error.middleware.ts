import { Request, Response, NextFunction } from 'express'
import { HttpException } from '@exceptions/HttpException'

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
  err: TypeError | HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let customError = err

  if (!(err instanceof HttpException)) {
    customError = new HttpException(
      'Oh no, this is embarrasing. We are having troubles my friend'
    )
  }
  console.log(err)

  // we are not using the next function to prevent from triggering
  // the default error-handler. However, make sure you are sending a
  // response to client to prevent memory leaks in case you decide to
  // NOT use, like in this example, the NextFunction .i.e., next(new Error())
  res.status((customError as HttpException).status).send(customError)
}

export default errorHandler
