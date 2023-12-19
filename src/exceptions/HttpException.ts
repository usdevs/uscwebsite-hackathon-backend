export enum HttpCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export class HttpException {
  public status: HttpCode
  public message: any

  constructor(message: any, status: HttpCode = HttpCode.InternalServerError) {
    this.status = status
    this.message = message
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, HttpCode.Unauthorized)
  }
}
