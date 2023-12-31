import { HttpCode, HttpException } from './HttpException'

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, HttpCode.Unauthorized)
  }
}
