import { Policy } from '../../interfaces/policy.interface'
import { All } from './all'
import { Allow } from './allow'
import { Deny } from './deny'

describe('All Policy', () => {
  let mockPolicies: Policy[]

  beforeEach(() => {
    mockPolicies = [new Allow(), new Allow()]
  })

  test('should allow if all policies allow', async () => {
    const policy = new All(...mockPolicies)
    const result = await policy.Validate()

    expect(result).toEqual('allow')
    expect(policy.Reason()).toEqual('')
  })

  test('should deny if any policy denies', async () => {
    const policy = new All(...[new Allow(), new Deny()])
    const result = await policy.Validate()

    expect(result).toEqual('deny')
    expect(policy.Reason()).toMatch(/Denied/)
  })
})
