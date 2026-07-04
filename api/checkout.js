// POST /api/checkout — creates a Stripe Checkout Session and returns its URL.
// The browser redirects the customer to that URL to pay on Stripe's secure page.
// No card data ever touches our server.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return res.status(500).json({ error: 'Payments are not configured yet.' })

  const o = req.body || {}
  const packageName = (o.package || 'Rexran order').toString().slice(0, 120)
  const total = Number(o.total)

  if (!total || total < 1) return res.status(400).json({ error: 'Invalid amount' })

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
  params.append('success_url', `${base}/?paid=1&session_id={CHECKOUT_SESSION_ID}`)
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
  params.append('metadata[package]', packageName)

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
