export enum HttpCode {
  NotFound = 404,
  InternalServerError = 500,
}

export class HttpError {
  message!: string
  status!: number
  additionalInfo!: any

  constructor(
    message: string,
    status: HttpCode = HttpCode.InternalServerError,
    additionalInfo: any = {}
  ) {
    this.message = message
    this.status = status
    this.additionalInfo = additionalInfo
  }
}
