// POST /api/deliveries — protected: create, list, or delete a client delivery.
// Body: { password, action: 'create'|'list'|'delete', delivery?: {...}, id? }
// Each delivery gets a hard-to-guess public id used in /delivery/:id
import { Redis } from '@upstash/redis'
import crypto from 'crypto'

const redis = Redis.fromEnv()
const KEY = 'rexran:deliveries'

// short, URL-safe, hard-to-guess id (e.g. "k3f9a2c7d1")
function makeId() {
  return crypto.randomBytes(8).toString('hex').slice(0, 12)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const adminPw = process.env.ADMIN_PASSWORD
  const { password, action, delivery, id } = req.body || {}

  if (!adminPw || password !== adminPw) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    let list = (await redis.get(KEY)) || []

    if (action === 'list') {
      return res.status(200).json({ ok: true, deliveries: list })
    }

    if (action === 'create') {
      if (!delivery || !Array.isArray(delivery.files) || delivery.files.length === 0) {
        return res.status(400).json({ error: 'Add at least one file' })
      }
      const item = {
        id: makeId(),
        client: (delivery.client || '').toString().slice(0, 120),
        note: (delivery.note || '').toString().slice(0, 500),
        files: delivery.files
          .filter((f) => f && f.url)
          .map((f) => ({
            url: String(f.url),
            name: (f.name || 'file').toString().slice(0, 200),
            type: (f.type || '').toString().slice(0, 40),
          })),
        createdAt: Date.now(),
      }
      list = [item, ...list]
      await redis.set(KEY, list)
      return res.status(200).json({ ok: true, delivery: item, deliveries: list })
    }

    if (action === 'delete') {
      list = list.filter((d) => d.id !== id)
      await redis.set(KEY, list)
      return res.status(200).json({ ok: true, deliveries: list })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) })
  }
}
