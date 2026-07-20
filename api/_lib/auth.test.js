import { describe, it, expect } from 'vitest'
import { checkPassword } from './auth.js'

describe('checkPassword', () => {
  it('accepts the correct password', () => {
    expect(checkPassword('secret123', 'secret123')).toBe(true)
  })

  it('rejects a wrong password', () => {
    expect(checkPassword('nope', 'secret123')).toBe(false)
  })

  it('rejects a candidate that is a prefix or different length', () => {
    expect(checkPassword('sec', 'secret123')).toBe(false)
    expect(checkPassword('secret1234', 'secret123')).toBe(false)
  })

  it('rejects when no admin password is configured', () => {
    expect(checkPassword('anything', '')).toBe(false)
    expect(checkPassword('anything', undefined)).toBe(false)
  })

  it('treats a missing candidate as a non-match rather than throwing', () => {
    expect(checkPassword(undefined, 'secret123')).toBe(false)
    expect(checkPassword(null, 'secret123')).toBe(false)
  })
})
