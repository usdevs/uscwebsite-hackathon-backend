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
  const userToDeleteId = parseInt(req.params['id'], 10)
  if (Number.isNaN(userToDeleteId)) {
    throw new HttpException('User id not found', HttpCode.BadRequest)
  }

  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  if (req.user.id === userToDeleteId) {
    throw new HttpException('Cannot delete self', HttpCode.BadRequest)
  }

  await Policy.Authorize(deleteUserAction, Policy.deleteUserPolicy(), req.user)

  const user = await destroyUser(userToDeleteId)
  res.status(200).json(user)
}
