// GET /api/promo — public: the one active promotion shown site-wide, or null.
// Only announcement-safe fields are returned; the real discount is applied
// server-side at checkout (see api/checkout.js + api/_lib/promo.js).
import { getActivePromo } from './_lib/promo.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const promo = await getActivePromo()
    if (!promo) return res.status(200).json({ promo: null })
    return res.status(200).json({
      promo: {
        id: promo.id,
        type: promo.type,
        value: promo.value,
        headline: promo.headline,
        detail: promo.detail,
        expiresAt: promo.expiresAt || null,
      },
    })
  } catch (e) {
    return res.status(500).json({ error: 'Could not load promo', detail: String(e) })
  }
}
