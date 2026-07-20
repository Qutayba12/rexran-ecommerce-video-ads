// POST /api/admin-testimonials — protected: list/approve/reject/delete
// client testimonials. Body: { password, action: 'list'|'approve'|'reject'|'delete', id? }
import { Redis } from '@upstash/redis'
import { checkPassword } from './_lib/auth.js'
import { isBlockedByFailedAttempts, recordFailedAttempt } from './_lib/rateLimit.js'

const redis = Redis.fromEnv()
const KEY = 'rexran:testimonials'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password, action, id } = req.body || {}

  if (await isBlockedByFailedAttempts(req, 'admin', 10)) {
    return res.status(429).json({ error: 'Too many attempts. Try again later.' })
  }
  if (!checkPassword(password, process.env.ADMIN_PASSWORD)) {
    await recordFailedAttempt(req, 'admin', 15 * 60)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    let list = (await redis.get(KEY)) || []

    if (action === 'list') {
      return res.status(200).json({ ok: true, testimonials: list })
    }

    if (action === 'approve' || action === 'reject') {
      list = list.map((t) => (t.id === id ? { ...t, status: action === 'approve' ? 'approved' : 'rejected' } : t))
      await redis.set(KEY, list)
      return res.status(200).json({ ok: true, testimonials: list })
    }

    if (action === 'delete') {
      list = list.filter((t) => t.id !== id)
      await redis.set(KEY, list)
      return res.status(200).json({ ok: true, testimonials: list })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) })
  }
}
