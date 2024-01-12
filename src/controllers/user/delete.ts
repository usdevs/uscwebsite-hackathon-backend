import { Response } from 'express'
import { destroyUser } from '@services/users'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import * as Policy from '@/policy'

const deleteUserAction = 'delete user'

export async function deleteUser(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const userToDelete = parseInt(req.params['id'], 10)
  if (Number.isNaN(userToDelete)) {
    throw new HttpException('User id not found', HttpCode.BadRequest)
  }
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(deleteUserAction, Policy.deleteUserPolicy(), req.user)

  const user = await destroyUser(userToDelete)
  res.status(200).json(user)
}
