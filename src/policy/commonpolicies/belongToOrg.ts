import { Policy } from '@/interfaces/policy.interface'
import { getUserOrgs, getUserRoles } from '@/services/users'
import { User } from '@prisma/client'

export class BelongToOrg implements Policy {
  private orgId: number
  private reason: string = ''

  constructor(orgId: number) {
    this.orgId = orgId
  }

  public Validate = async (u?: User): Promise<Decision> => {
    if (!u) {
      this.reason = 'User is not logged in'
      return 'deny'
    }

    const orgs = await getUserOrgs(u.id)
    const belongToOrg = orgs.some((org) => org.id === this.orgId)

    if (!belongToOrg) {
      this.reason = `User does not belong to org id - ${this.orgId}`
    }

    return belongToOrg ? 'allow' : 'deny'
  }

  public Reason = () => this.reason
}
