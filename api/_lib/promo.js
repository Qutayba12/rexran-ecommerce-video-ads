// Store-wide promotions — the single source of truth for both the public
// banner and the discount actually applied at checkout. Discount math lives
// here (server-side only) so a tampered client can never change what Stripe
// charges. A "gift" promo is announcement-only and never changes the price.
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const KEY = 'rexran:promos'

export async function getAllPromos() {
  return (await redis.get(KEY)) || []
}

export async function savePromos(list) {
  await redis.set(KEY, list)
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
