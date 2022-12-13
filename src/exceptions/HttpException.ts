export enum HttpCode {
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}

export class HttpException {
  public status: HttpCode
  public message: string

  constructor(
    message: string,
    status: HttpCode = HttpCode.InternalServerError
  ) {
    this.status = status
    this.message = message
  }
}
