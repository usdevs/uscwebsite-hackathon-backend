import { Response } from 'express'
import { updateOrg } from '@/services/organisations'
import { RequestWithUser } from '@interfaces/auth.interface'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { OrganisationSchema } from '@interfaces/organisation.interface'
import Policy from '@/policy'

const editOrgAction = 'Edit organisation'

export async function editOrganisation(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const orgId = parseInt(req.params['id'], 10)
  if (Number.isNaN(orgId)) {
    throw new HttpException('Org id is not a number', HttpCode.BadRequest)
  }

  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }

  const userId = user.id
  const orgUpdateRes = OrganisationSchema.safeParse(req.body)
  if (!orgUpdateRes.success) {
    throw new HttpException('Invalid org data', HttpCode.BadRequest)
  }

  await Policy.Authorize(editOrgAction, Policy.updateOrgPolicy(), req.user)

  const org = orgUpdateRes.data
  const orgPayload = { ...org, userId }
  const updatedOrg = await updateOrg(orgId, orgPayload)

  res.status(200).json({ result: [updatedOrg] })
}
