import { describe, it, expect } from 'vitest'
import { pickActivePromo, applyPromoToTotal } from './promo.js'

describe('pickActivePromo', () => {
  const now = 1_000_000

  it('returns null for an empty or non-array store', () => {
    expect(pickActivePromo([], now)).toBeNull()
    expect(pickActivePromo(null, now)).toBeNull()
    expect(pickActivePromo(undefined, now)).toBeNull()
  })

  it('returns the active, non-expired promo', () => {
    const p = { id: 'a', active: true, type: 'percent', value: 20, expiresAt: null }
    expect(pickActivePromo([p], now)).toBe(p)
  })

  it('ignores inactive promos', () => {
    expect(pickActivePromo([{ id: 'a', active: false, type: 'percent', value: 20 }], now)).toBeNull()
  })

  it('ignores an active promo whose expiry has passed', () => {
    const p = { id: 'a', active: true, type: 'percent', value: 20, expiresAt: now - 1 }
    expect(pickActivePromo([p], now)).toBeNull()
  })

  it('keeps an active promo whose expiry is still in the future', () => {
    const p = { id: 'a', active: true, type: 'percent', value: 20, expiresAt: now + 1 }
    expect(pickActivePromo([p], now)).toBe(p)
  })

  it('returns the first active promo when several qualify', () => {
    const a = { id: 'a', active: true, type: 'percent', value: 10 }
    const b = { id: 'b', active: true, type: 'percent', value: 20 }
    expect(pickActivePromo([a, b], now)).toBe(a)
  })
})

describe('applyPromoToTotal', () => {
  it('leaves the total unchanged with no promo', () => {
    expect(applyPromoToTotal(99, null)).toBe(99)
  })

  it('never discounts for a gift promo', () => {
    expect(applyPromoToTotal(99, { type: 'gift', value: 0 })).toBe(99)
  })

  it('applies a percentage discount, rounded to cents', () => {
    expect(applyPromoToTotal(99, { type: 'percent', value: 20 })).toBe(79.2)
    expect(applyPromoToTotal(39, { type: 'percent', value: 15 })).toBe(33.15)
    expect(applyPromoToTotal(100, { type: 'percent', value: 50 })).toBe(50)
  })

  it('clamps a percentage to the 1–90 range', () => {
    expect(applyPromoToTotal(100, { type: 'percent', value: 200 })).toBe(10) // capped at 90% off
    expect(applyPromoToTotal(100, { type: 'percent', value: 0 })).toBe(99) // floored at 1% off
  })

  it('applies a fixed-dollar discount', () => {
    expect(applyPromoToTotal(99, { type: 'fixed', value: 20 })).toBe(79)
    expect(applyPromoToTotal(39, { type: 'fixed', value: 9.5 })).toBe(29.5)
  })

  it('never drops the charge below $1, even with an oversized fixed discount', () => {
    expect(applyPromoToTotal(30, { type: 'fixed', value: 999 })).toBe(1)
  })

  it('returns the base for a malformed total', () => {
    expect(applyPromoToTotal(NaN, { type: 'percent', value: 20 })).toBeNaN()
  })
})
