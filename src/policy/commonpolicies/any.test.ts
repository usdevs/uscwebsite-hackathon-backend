import { Policy } from '../../interfaces/policy.interface'
import { Any } from './any'
import { Allow } from './allow'
import { Deny } from './deny'

describe('Any Policy', () => {
  let mockPolicies: Policy[]

  beforeEach(() => {
    mockPolicies = [new Allow(), new Deny()]
  })

  test('should allow if any policy allows', async () => {
    const policy = new Any(...mockPolicies)
    const result = await policy.Validate()

    expect(result).toEqual('allow')
    expect(policy.Reason()).toEqual('')
  })

  test('should deny if all policies deny', async () => {
    const policy = new Any(...[new Deny(), new Deny()])
    const result = await policy.Validate()

    expect(result).toEqual('deny')
    expect(policy.Reason()).toMatch(/Denied/)
  })
})
