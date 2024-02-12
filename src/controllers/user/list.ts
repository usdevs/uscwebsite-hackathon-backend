import { Response } from 'express'
import { getAllUsers } from '@services/users'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { RequestWithUser } from '@interfaces/auth.interface'
import * as Policy from '@/policy'

const listUserAction = 'list user'

/**
 * Retrieves all users' details
 * @param req not used
 * @param res json with all users' details
 * @param next
 */
export async function listUser(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  await Policy.Authorize(listUserAction, Policy.listUserPolicy(), user)

  const users = await getAllUsers()
  res.json(users)
}
