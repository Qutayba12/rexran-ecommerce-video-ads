// POST /api/checkout — creates a Stripe Checkout Session and returns its URL.
// The browser redirects the customer to that URL to pay on Stripe's secure page.
// No card data ever touches our server.
import { computeTotal, MIN_ORDER } from './_lib/pricing.js'
import { limitRequest } from './_lib/rateLimit.js'
import { getActivePromo, getAllCodes, findValidCode, bestChargeTotal } from './_lib/promo.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!(await limitRequest(req, 'checkout', 20, 10 * 60))) {
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' })
  }

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return res.status(500).json({ error: 'Payments are not configured yet.' })

  const o = req.body || {}
  const packageName = (o.package || 'Rexran order').toString().slice(0, 120)

  // The charge amount is always recomputed from the canonical price table —
  // the client-sent total is display-only and never trusted here.
  const baseTotal = computeTotal(o)
  if (!baseTotal || baseTotal < 1) return res.status(400).json({ error: 'Invalid order' })
  // TEMPORARY: a $1-test order (contains the 'test' service) skips the minimum.
  // Remove this exemption with the test service before launch.
  const isTestOrder = Array.isArray(o.items) && o.items.some((it) => it && it.key === 'test')
  if (o.package === 'Custom' && !isTestOrder && baseTotal < MIN_ORDER) {
    return res.status(400).json({ error: `Minimum order is $${MIN_ORDER}` })
  }

  // Apply a discount server-side (the min-order gate above is on the
  // pre-discount order size). The customer gets the better of the active
  // store-wide promo and a typed code — never both stacked, never trusting a
  // client-sent price. A gift promo leaves the price unchanged.
  let promo = null
  let codeMatch = null
  try {
    promo = await getActivePromo()
    if (o.promoCode) codeMatch = findValidCode(await getAllCodes(), o.promoCode)
  } catch { /* no promo store / unreachable — charge full price */ }
  const { total, source } = bestChargeTotal(baseTotal, promo, codeMatch)

  // Base URL for redirects (works on rexran.com and preview URLs)
  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0]
  const host = (req.headers['x-forwarded-host'] || req.headers.host || 'rexran.com').toString()
  const base = `${proto}://${host}`

  // Build a short line-item description from the order
  let description = packageName
  if (Array.isArray(o.items) && o.items.length) {
    description += ' — ' + o.items.map((it) => `${it.qty ? it.qty + '× ' : ''}${it.label}`).join(', ')
  }
  description = description.slice(0, 240)

  // Stripe expects form-encoded bodies and amounts in the smallest unit (pence)
  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', `${base}/thank-you?paid=1&session_id={CHECKOUT_SESSION_ID}`)
  params.append('cancel_url', `${base}/?canceled=1`)
  params.append('line_items[0][quantity]', '1')
  params.append('line_items[0][price_data][currency]', 'usd')
  params.append('line_items[0][price_data][unit_amount]', String(Math.round(total * 100)))
  params.append('line_items[0][price_data][product_data][name]', `Rexran — ${packageName}`)
  if (description) params.append('line_items[0][price_data][product_data][description]', description)
  params.append('billing_address_collection', 'auto')
  // Collect the customer email on Stripe's page and prefill if we already have it
  if (o.email) params.append('customer_email', String(o.email).slice(0, 200))
  // Save order context so it shows on the payment in the Stripe dashboard
  if (o.brand) params.append('metadata[brand]', String(o.brand).slice(0, 200))
  if (o.offer) params.append('metadata[offer]', String(o.offer).slice(0, 200))
  if (o.productUrl) params.append('metadata[product_url]', String(o.productUrl).slice(0, 400))
  if (o.language) params.append('metadata[language]', String(o.language).slice(0, 60))
  if (o.notes) params.append('metadata[notes]', String(o.notes).slice(0, 480))
  if (Array.isArray(o.items) && o.items.length) {
    const summary = o.items.map((it) => {
      const sizes = (it.ratios && it.ratios.length) ? ` (${it.ratios.join('/')})` : ''
      const dur = it.duration ? ` ${it.duration}` : ''
      return `${it.qty ? it.qty + '× ' : ''}${it.label}${dur}${sizes}`
    }).join(', ')
    params.append('metadata[services]', summary.slice(0, 480))
  }
  // Product reference photos the customer uploaded — each gets its own
  // metadata key (Stripe caps a single value at 500 chars, too short for
  // several blob URLs joined together). Capped to 6 photos.
  if (Array.isArray(o.photos)) {
    o.photos.slice(0, 6).forEach((url, i) => {
      if (typeof url === 'string' && url.startsWith('https://')) {
        params.append(`metadata[photo_${i + 1}]`, url.slice(0, 500))
      }
    })
  }
  params.append('metadata[package]', packageName)
  // Record the applied discount so it's visible on the payment in Stripe and,
  // via the webhook, stored on the order (promo_code powers the admin stats).
  if (source && total < baseTotal) {
    const applied = source === 'code' ? codeMatch : promo
    const label = applied.type === 'percent' ? `${applied.value}% off` : `$${applied.value} off`
    const name = source === 'code' ? `Code ${codeMatch.code}` : promo.headline
    params.append('metadata[promo]', `${name} (${label})`.slice(0, 200))
    params.append('metadata[original_total]', `$${baseTotal}`)
    if (source === 'code') params.append('metadata[promo_code]', String(codeMatch.code).slice(0, 40))
  }

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const data = await r.json()
    if (!r.ok) {
      return res.status(502).json({ error: data?.error?.message || 'Could not start checkout' })
    }
    return res.status(200).json({ url: data.url })
  } catch (e) {
    return res.status(500).json({ error: String(e instanceof Error ? e.message : e) })
  }
}
