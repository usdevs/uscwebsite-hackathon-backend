import { Response, NextFunction } from 'express'
import { addUser, deleteUser, getAllUsers, updateUser } from "@services/users";
import { HttpCode, HttpException } from "@exceptions/HttpException";
import { RequestWithUser } from "@interfaces/auth.interface";
import { UserSchema } from "@interfaces/user.interface";

/**
 * Retrieves all users' details
 * @param req not used
 * @param res json with all users' details
 * @param next
 */
export async function getUsers(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }
  const users = await getAllUsers()
  res.json(users)
}

export async function createUser(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const newUser = UserSchema.parse(req.body)
  const userPayload = { ...newUser, adminUserId: user.id }
  const inserted = await addUser(userPayload)
  res.status(200).json({ result: [inserted] })
}

export async function editUser(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const userToUpdateId = parseInt(req.params['id'], 10)
  if (Number.isNaN(userToUpdateId)) {
    throw new HttpException('User id not found', HttpCode.BadRequest)
  }
  const adminUser = req.user
  if (!adminUser) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }
  const adminUserId = adminUser.id
  const user = UserSchema.parse(req.body)
  const userPayload = { ...user, adminUserId: adminUserId }
  const updatedUser = await updateUser(userToUpdateId, userPayload)
  res.status(200).json({ result: [updatedUser] })
}

export async function deleteUserFromDb(
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
  const user = await deleteUser(userToDelete, req.user.id)
  res.status(200).json(user)
}
