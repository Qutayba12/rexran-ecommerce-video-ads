// Constant-time password comparison — avoids leaking the admin password via
// response-timing side channels (String !== bails out on the first mismatched
// byte, so a naive comparison's timing correlates with how many leading
// characters are correct).
import crypto from 'crypto'

export function checkPassword(candidate, expected) {
  if (!expected) return false
  const a = crypto.createHash('sha256').update(String(candidate ?? '')).digest()
  const b = crypto.createHash('sha256').update(String(expected)).digest()
  return crypto.timingSafeEqual(a, b)
}
