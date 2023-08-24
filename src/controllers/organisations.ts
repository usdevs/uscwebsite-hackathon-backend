import { Response, Request, NextFunction } from 'express'
import { deleteOrg, getAllOrgCategories, getAllOrgs, updateOrg } from "@/services/organisations";
import { RequestWithUser } from "@interfaces/auth.interface";
import { HttpCode, HttpException } from "@exceptions/HttpException";
import { OrganisationSchema } from "@interfaces/organisation.interface";

/**
 * Retrieves all organisation details
 * @param req not used
 * @param res json with all organisation details
 * @param next
 */
export async function getOrgs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orgs = await getAllOrgs()
    res.json(orgs)
  } catch (error) {
    next(error)
  }
}

export async function getOrgCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orgs = await getAllOrgCategories()
    res.json(orgs)
  } catch (error) {
    next(error)
  }
}

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
