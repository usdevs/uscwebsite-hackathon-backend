import { Policy } from '@/interfaces/policy.interface'
import { User } from '@prisma/client'

export class AllowIfRoleIs implements Policy {
  private roleName: string

  constructor(roleName: string) {
    this.roleName = roleName
  }

  // TODO:
  public Validate = async (u?: User): Promise<Decision> => {
    return 'allow'
  }

  public Reason = () => ''
}
