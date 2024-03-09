import { Response } from 'express'
import { deleteOrg } from '@/services/organisations'
import { RequestWithUser } from '@interfaces/auth.interface'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import * as Policy from '@/policy'

const deleteOrgAction = 'delete organisation'

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

  await Policy.Authorize(deleteOrgAction, Policy.deleteOrgPolicy(), req.user)

  const org = await deleteOrg(orgId)
  res.status(200).json(org)
}
