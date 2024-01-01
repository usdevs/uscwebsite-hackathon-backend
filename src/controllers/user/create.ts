import { Response } from 'express'
import { addUser } from '@services/users'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import { UserSchema } from '@interfaces/user.interface'

export async function createUser(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const newUser = UserSchema.parse(req.body)
  const adminUserId = user.id
  const inserted = await addUser(newUser, adminUserId)
  res.status(200).json({ result: [inserted] })
}
