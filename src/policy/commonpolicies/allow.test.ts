import { Allow } from './allow'

describe('Allow Policy', () => {
  let policy: Allow

  beforeEach(() => {
    policy = new Allow()
  })

  test('should always return allow', async () => {
    const result = await policy.Validate()
    expect(result).toEqual('allow')
  })

  test('should return the correct reason', () => {
    expect(policy.Reason()).toEqual('Allowed.')
  })
})
