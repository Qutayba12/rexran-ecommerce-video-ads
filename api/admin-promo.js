// POST /api/admin-promo — protected: manage store-wide promotions.
// Body: { password, action: 'list'|'create'|'activate'|'deactivate'|'delete', promo?, id? }
import crypto from 'crypto'
import { checkPassword } from './_lib/auth.js'
import { isBlockedByFailedAttempts, recordFailedAttempt } from './_lib/rateLimit.js'
import { getAllPromos, savePromos } from './_lib/promo.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password, action, promo, id } = req.body || {}

  if (await isBlockedByFailedAttempts(req, 'admin', 10)) {
    return res.status(429).json({ error: 'Too many attempts. Try again later.' })
  }
  if (!checkPassword(password, process.env.ADMIN_PASSWORD)) {
    await recordFailedAttempt(req, 'admin', 15 * 60)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    let list = await getAllPromos()

    if (action === 'list') {
      return res.status(200).json({ ok: true, promos: list })
    }

    if (action === 'create') {
      const type = ['percent', 'fixed', 'gift'].includes(promo?.type) ? promo.type : null
      if (!type) return res.status(400).json({ error: 'Invalid promo type' })

      const headline = (promo.headline || '').toString().trim().slice(0, 80)
      if (!headline) return res.status(400).json({ error: 'Add a headline' })
      const detail = (promo.detail || '').toString().trim().slice(0, 200)

      let value = 0
      if (type === 'percent') {
        value = Math.round(Number(promo.value))
        if (!Number.isInteger(value) || value < 1 || value > 90) {
          return res.status(400).json({ error: 'Percentage must be between 1 and 90' })
        }
      } else if (type === 'fixed') {
        value = Math.round(Number(promo.value) * 100) / 100
        if (!(value > 0)) return res.status(400).json({ error: 'Amount must be greater than 0' })
      }

      let expiresAt = null
      if (promo.expiresAt) {
        const t = new Date(promo.expiresAt).getTime()
        if (Number.isFinite(t)) expiresAt = t
      }

      const active = promo.active !== false // default on
      const item = {
        id: crypto.randomBytes(8).toString('hex'),
        type,
        value,
        headline,
        detail,
        expiresAt,
        active,
        createdAt: Date.now(),
      }
      // Only one promo can be active at a time — turn the rest off.
      if (active) list = list.map((p) => ({ ...p, active: false }))
      list = [item, ...list]
      await savePromos(list)
      return res.status(200).json({ ok: true, promos: list })
    }

    if (action === 'activate') {
      list = list.map((p) => ({ ...p, active: p.id === id }))
      await savePromos(list)
      return res.status(200).json({ ok: true, promos: list })
    }

    if (action === 'deactivate') {
      list = list.map((p) => (p.id === id ? { ...p, active: false } : p))
      await savePromos(list)
      return res.status(200).json({ ok: true, promos: list })
    }

    if (action === 'delete') {
      list = list.filter((p) => p.id !== id)
      await savePromos(list)
      return res.status(200).json({ ok: true, promos: list })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) })
  }
}
