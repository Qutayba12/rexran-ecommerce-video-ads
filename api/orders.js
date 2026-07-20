// POST /api/orders — protected: list confirmed (paid) orders for the admin panel.
// Orders are written by api/stripe-webhook.js once a payment is confirmed.
import { Redis } from '@upstash/redis'
import { checkPassword } from './_lib/auth.js'

const redis = Redis.fromEnv()
const KEY = 'rexran:orders'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password } = req.body || {}
  if (!checkPassword(password, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const orders = (await redis.get(KEY)) || []
    return res.status(200).json({ ok: true, orders })
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) })
  }
}
