import { Response, NextFunction } from 'express'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { ZodError } from 'zod'
import { RequestWithUser } from '@/interfaces/auth.interface'

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
  err: Error,
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  let customError

  // We use if-else as switch-case does not support type inference without casting
  if (err instanceof ZodError) {
    customError = new HttpException(err.flatten(), HttpCode.BadRequest)
  } else if (err instanceof SyntaxError && 'body' in err) {
    customError = new HttpException(err.message, HttpCode.BadRequest)
  } else if (err instanceof HttpException) {
    customError = err
  } else {
    customError = new HttpException(err.message)
    console.log(err)
  }

  // Detailed request and error logging
  console.error({
    message: customError.message,
    status: (customError as HttpException).status,
    requestBody: req.body,
    requestUser: req.user,
    stack: err.stack,
  })

  res.status((customError as HttpException).status).send(customError)
}

export default errorHandler
