// Store-wide promotions — the single source of truth for both the public
// banner and the discount actually applied at checkout. Discount math lives
// here (server-side only) so a tampered client can never change what Stripe
// charges. A "gift" promo is announcement-only and never changes the price.
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const KEY = 'rexran:promos'
const CODES_KEY = 'rexran:promocodes'

export async function getAllPromos() {
  return (await redis.get(KEY)) || []
}

export async function savePromos(list) {
  await redis.set(KEY, list)
}

export async function getAllCodes() {
  return (await redis.get(CODES_KEY)) || []
}

export async function saveCodes(list) {
  await redis.set(CODES_KEY, list)
}

// Normalise however a customer typed a code: trim + uppercase, so "welcome10"
// matches "WELCOME10". Returns '' for anything unusable.
export function normalizeCode(raw) {
  return (raw || '').toString().trim().toUpperCase().slice(0, 40)
}

// The matching active, non-expired code object (or null). Unlike the store-wide
// promo, many codes can be active at once — a customer just has to type one.
export function findValidCode(list, raw, now = Date.now()) {
  const code = normalizeCode(raw)
  if (!code || !Array.isArray(list)) return null
  return list.find((c) => c && c.active && c.code === code && (!c.expiresAt || c.expiresAt > now)) || null
}

// The one active, non-expired promo (or null). Only one is ever active at a
// time — the admin endpoint deactivates the others when one is turned on.
export function pickActivePromo(list, now = Date.now()) {
  if (!Array.isArray(list)) return null
  return list.find((p) => p && p.active && (!p.expiresAt || p.expiresAt > now)) || null
}

export async function getActivePromo(now = Date.now()) {
  return pickActivePromo(await getAllPromos(), now)
}

// Applies a promo to a base total, returning the amount to actually charge.
// Rounds to cents and never drops below $1. Gift / no-promo => unchanged.
export function applyPromoToTotal(total, promo) {
  const base = Number(total)
  if (!promo || promo.type === 'gift' || !Number.isFinite(base)) return base
  if (promo.type === 'percent') {
    const pct = Math.min(90, Math.max(1, Math.round(Number(promo.value) || 0)))
    return Math.max(1, Math.round(base * (100 - pct)) / 100)
  }
  if (promo.type === 'fixed') {
    const amt = Math.max(0, Number(promo.value) || 0)
    return Math.max(1, Math.round((base - amt) * 100) / 100)
  }
  return base
}

// The customer gets the better (lower-priced) of the active store-wide promo
// and a typed code — never both stacked. Returns { total, source } where
// source is 'code' | 'promo' | null (null = no discount applied).
export function bestChargeTotal(total, promo, code) {
  const base = Number(total)
  const promoPrice = applyPromoToTotal(base, promo)
  const codePrice = applyPromoToTotal(base, code)
  const promoBeats = promo && promoPrice < base
  const codeBeats = code && codePrice < base
  if (codeBeats && (!promoBeats || codePrice <= promoPrice)) return { total: codePrice, source: 'code' }
  if (promoBeats) return { total: promoPrice, source: 'promo' }
  return { total: base, source: null }
}
