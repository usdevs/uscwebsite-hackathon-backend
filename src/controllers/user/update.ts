import { Response } from 'express'
import { updateUser } from '@services/users'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import { UserSchema } from '@interfaces/user.interface'
import * as Policy from '@/policy'

const editUserAction = 'edit user'

export async function editUser(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const userToUpdateId = parseInt(req.params['id'], 10)
  if (Number.isNaN(userToUpdateId)) {
    throw new HttpException('User id is not a number', HttpCode.BadRequest)
  }

  const userToUpdateRes = UserSchema.safeParse(req.body)
  if (!userToUpdateRes.success) {
    throw new HttpException('Invalid user data', HttpCode.BadRequest)
  }

  const userToUpdate = userToUpdateRes.data

  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(editUserAction, Policy.updateUserPolicy(), user)

  const updatedUser = await updateUser(userToUpdateId, userToUpdate)
  res.status(200).json({ result: [updatedUser] })
}
