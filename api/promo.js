// GET  /api/promo — public: the one active promotion shown site-wide, or null.
// POST /api/promo — protected: manage promotions (list/create/activate/
//   deactivate/delete). Both live on one endpoint to stay under Vercel's
//   serverless-function limit. The real discount is applied server-side at
//   checkout (see api/checkout.js + api/_lib/promo.js).
import crypto from 'crypto'
import { checkPassword } from './_lib/auth.js'
import { isBlockedByFailedAttempts, recordFailedAttempt, limitRequest } from './_lib/rateLimit.js'
import { getActivePromo, getAllPromos, savePromos, getAllCodes, saveCodes, normalizeCode, findValidCode } from './_lib/promo.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // ?code=XXX — public: validate a customer-typed code (rate-limited so it
      // can't be brute-forced). Returns the discount if valid, else code:null.
      const raw = req.query?.code
      if (raw != null) {
        if (!(await limitRequest(req, 'promocode', 30, 10 * 60))) {
          return res.status(429).json({ error: 'Too many attempts. Please try again shortly.' })
        }
        const match = findValidCode(await getAllCodes(), raw)
        if (!match) return res.status(200).json({ code: null })
        return res.status(200).json({ code: { code: match.code, type: match.type, value: match.value } })
      }

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

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password, action, promo, code, id } = req.body || {}

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

    // ----- Promo codes (many can be active; customer types one at checkout) -----
    if (action === 'code-list') {
      return res.status(200).json({ ok: true, codes: await getAllCodes() })
    }

    if (action === 'code-create') {
      let codes = await getAllCodes()
      const codeStr = normalizeCode(code?.code)
      if (codeStr.length < 3) return res.status(400).json({ error: 'Code must be at least 3 characters' })
      if (codes.some((c) => c.code === codeStr)) return res.status(400).json({ error: 'That code already exists' })

      const type = ['percent', 'fixed'].includes(code?.type) ? code.type : null
      if (!type) return res.status(400).json({ error: 'Invalid code type' })

      let value = 0
      if (type === 'percent') {
        value = Math.round(Number(code.value))
        if (!Number.isInteger(value) || value < 1 || value > 90) {
          return res.status(400).json({ error: 'Percentage must be between 1 and 90' })
        }
      } else {
        value = Math.round(Number(code.value) * 100) / 100
        if (!(value > 0)) return res.status(400).json({ error: 'Amount must be greater than 0' })
      }

      let expiresAt = null
      if (code.expiresAt) {
        const t = new Date(code.expiresAt).getTime()
        if (Number.isFinite(t)) expiresAt = t
      }

      const item = {
        id: crypto.randomBytes(8).toString('hex'),
        code: codeStr,
        type,
        value,
        expiresAt,
        active: code.active !== false,
        createdAt: Date.now(),
      }
      codes = [item, ...codes]
      await saveCodes(codes)
      return res.status(200).json({ ok: true, codes })
    }

    if (action === 'code-activate' || action === 'code-deactivate') {
      const codes = (await getAllCodes()).map((c) => (c.id === id ? { ...c, active: action === 'code-activate' } : c))
      await saveCodes(codes)
      return res.status(200).json({ ok: true, codes })
    }

    if (action === 'code-delete') {
      const codes = (await getAllCodes()).filter((c) => c.id !== id)
      await saveCodes(codes)
      return res.status(200).json({ ok: true, codes })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) })
  }
}
