import { Response, NextFunction } from 'express'
import { getAllUsers } from "@services/users";
import { HttpCode, HttpException } from "@exceptions/HttpException";
import { RequestWithUser } from "@interfaces/auth.interface";

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
