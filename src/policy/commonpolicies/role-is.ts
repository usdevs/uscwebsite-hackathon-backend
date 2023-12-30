import { Policy } from '@/interfaces/policy.interface'
import { getUserRoles } from '@/services/users'
import { User } from '@prisma/client'

export class AllowIfRoleIs implements Policy {
  private roleName: string
  private reason: string = ''

  constructor(roleName: string) {
    this.roleName = roleName
  }

  public Validate = async (u?: User): Promise<Decision> => {
    if (!u) {
      this.reason = 'User is not logged in'
      return 'deny'
    }

    const roles = await getUserRoles(u.id)
    const hasRole = roles.some((r) => r.name === this.roleName)

    return hasRole ? 'allow' : 'deny'
  }

  public Reason = () => this.reason
}
