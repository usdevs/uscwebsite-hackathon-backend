import { Response } from 'express'
import { updateOrg } from '@/services/organisations'
import { RequestWithUser } from '@interfaces/auth.interface'
import { HttpCode, HttpException } from '@exceptions/HttpException'
import { OrganisationSchema } from '@interfaces/organisation.interface'

export async function editOrganisation(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const orgId = parseInt(req.params['id'], 10)
  if (Number.isNaN(orgId)) {
    throw new HttpException('Org id not a number', HttpCode.BadRequest)
  }
  const user = req.user
  if (!user) {
    throw new HttpException('Requires authentication', HttpCode.Unauthorized)
  }
  const userId = user.id
  const booking = OrganisationSchema.parse(req.body)
  const orgPayload = { ...booking, userId }
  const updatedOrg = await updateOrg(orgId, orgPayload)
  res.status(200).json({ result: [updatedOrg] })
}
