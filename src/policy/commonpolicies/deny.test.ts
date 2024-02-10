import { Deny } from './deny'

describe('Deny Policy', () => {
  let policy: Deny

  beforeEach(() => {
    policy = new Deny()
  })

  test('should always return deny', async () => {
    const result = await policy.Validate()
    expect(result).toEqual('deny')
  })

  test('should return the correct reason', () => {
    expect(policy.Reason()).toEqual('Denied. Only admin is allowed to perform this action.')
  })
})