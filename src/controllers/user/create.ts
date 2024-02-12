import { Response } from 'express'
import { addUser } from '@services/users'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import { UserSchema } from '@interfaces/user.interface'
import * as Policy from '@/policy'
import { UnauthorizedException } from '@/exceptions'

const createUserAction = 'create user'

export async function createUser(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const newUserRes = UserSchema.safeParse(req.body)
  if (!newUserRes.success) {
    throw new UnauthorizedException('Invalid new user data')
  }

  await Policy.Authorize(createUserAction, Policy.createUserPolicy(), user)

  const newUser = newUserRes.data
  const inserted = await addUser(newUser)
  res.status(200).json({ result: [inserted] })
}
