// Redis-backed rate limiting — protects the public contact/checkout
// endpoints from spam and the admin password from brute-forcing.
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return String(fwd).split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

// Fixed-window counter. Increments on every call; returns true while still
// within `limit` calls inside the current `windowSeconds` window.
async function withinLimit(key, limit, windowSeconds) {
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, windowSeconds)
  return count <= limit
}

// Throttles a public endpoint by caller IP — call once per incoming request.
export function limitRequest(req, scope, limit, windowSeconds) {
  return withinLimit(`ratelimit:${scope}:${clientIp(req)}`, limit, windowSeconds)
}

// Admin brute-force guard: check before verifying the password, and only
// record on a wrong password, so normal admin use never counts against it.
export async function isBlockedByFailedAttempts(req, scope, limit) {
  const key = `ratelimit:fail:${scope}:${clientIp(req)}`
  const count = Number((await redis.get(key)) || 0)
  return count >= limit
}

export async function recordFailedAttempt(req, scope, windowSeconds) {
  const key = `ratelimit:fail:${scope}:${clientIp(req)}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, windowSeconds)
}
