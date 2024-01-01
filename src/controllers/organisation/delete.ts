import { Response } from 'express'
import { deleteOrg } from '@/services/organisations'
import { RequestWithUser } from '@interfaces/auth.interface'
import { HttpCode, HttpException } from '@exceptions/HttpException'

export async function deleteOrganisation(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const orgId = parseInt(req.params['id'], 10)
  if (Number.isNaN(orgId)) {
    throw new HttpException('Org id not found', HttpCode.BadRequest)
  }
  if (!req.user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }
  const org = await deleteOrg(orgId, req.user.id)
  res.status(200).json(org)
}
