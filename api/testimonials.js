// GET /api/testimonials — public: approved client testimonials for the site.
// POST /api/testimonials — public (rate-limited): a client submits feedback
// tied to their delivery id. Stored as "pending" — nothing appears on the
// site until a studio admin approves it via /api/admin-testimonials.
import { Redis } from '@upstash/redis'
import crypto from 'crypto'
import { limitRequest } from './_lib/rateLimit.js'

const redis = Redis.fromEnv()
const KEY = 'rexran:testimonials'
const DELIVERIES_KEY = 'rexran:deliveries'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const list = (await redis.get(KEY)) || []
      const approved = list
        .filter((t) => t.status === 'approved')
        .map((t) => ({ id: t.id, client: t.client, rating: t.rating, text: t.text, createdAt: t.createdAt }))
      return res.status(200).json({ testimonials: approved })
    } catch (e) {
      return res.status(500).json({ error: 'Server error', detail: String(e) })
    }
  }

  if (req.method === 'POST') {
    if (!(await limitRequest(req, 'testimonial', 3, 10 * 60))) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' })
    }

    const { deliveryId, client, rating, text } = req.body || {}
    const id = (deliveryId || '').toString()
    if (!id) return res.status(400).json({ error: 'Missing deliveryId' })

    const cleanText = (text || '').toString().trim().slice(0, 600)
    const numRating = Number(rating)
    const hasRating = Number.isInteger(numRating) && numRating >= 1 && numRating <= 5
    if (!hasRating && cleanText.length < 3) {
      return res.status(400).json({ error: 'Add a rating or a note' })
    }

    try {
      const deliveries = (await redis.get(DELIVERIES_KEY)) || []
      if (!deliveries.some((d) => d.id === id)) {
        return res.status(404).json({ error: 'Delivery not found' })
      }

      const list = (await redis.get(KEY)) || []
      const item = {
        id: crypto.randomBytes(8).toString('hex'),
        deliveryId: id,
        client: (client || '').toString().slice(0, 120),
        rating: hasRating ? numRating : null,
        text: cleanText,
        status: 'pending',
        createdAt: Date.now(),
      }
      await redis.set(KEY, [item, ...list])
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: 'Server error', detail: String(e) })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
