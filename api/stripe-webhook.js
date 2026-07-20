// POST /api/stripe-webhook — receives payment confirmations from Stripe.
// Fires ONLY after a real successful payment, then notifies the studio
// (Telegram + email) with a "paid" confirmation.
import crypto from 'crypto'
import { Redis } from '@upstash/redis'

// Stripe needs the raw request body to verify the signature
export const config = { api: { bodyParser: false } }

const redis = Redis.fromEnv()
const ORDERS_KEY = 'rexran:orders'

// Persists a confirmed order so it survives even if Telegram/email delivery
// fails, and doubles as an idempotency guard: Stripe can redeliver the same
// webhook event, so we skip re-notifying once a session id is already saved.
async function saveOrder(session) {
  const m = session.metadata || {}
  const order = {
    id: session.id,
    package: m.package || '',
    amount: session.amount_total != null ? session.amount_total / 100 : null,
    currency: (session.currency || 'usd').toUpperCase(),
    email: session.customer_details?.email || session.customer_email || '',
    name: session.customer_details?.name || '',
    brand: m.brand || '',
    offer: m.offer || '',
    productUrl: m.product_url || '',
    language: m.language || '',
    services: m.services || '',
    notes: m.notes || '',
    createdAt: session.created ? session.created * 1000 : Date.now(),
  }
  const list = (await redis.get(ORDERS_KEY)) || []
  if (list.some((o) => o.id === order.id)) return false
  list.unshift(order)
  await redis.set(ORDERS_KEY, list)
  return true
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Verify Stripe's signature manually (no SDK needed)
function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false
  // Header looks like: t=timestamp,v1=sig1,v1=sig2,...
  const items = sigHeader.split(',').map((p) => p.split('='))
  const timestamp = items.find((i) => i[0] === 't')?.[1]
  const signatures = items.filter((i) => i[0] === 'v1').map((i) => i[1])
  if (!timestamp || signatures.length === 0) return false
  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')
  const expectedBuf = Buffer.from(expected)
  // Match against any provided signature (constant-time)
  return signatures.some((s) => {
    try {
      const sBuf = Buffer.from(s)
      return sBuf.length === expectedBuf.length && crypto.timingSafeEqual(sBuf, expectedBuf)
    } catch {
      return false
    }
  })
}

async function notify(session) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  const m = session.metadata || {}
  const amount = session.amount_total != null ? (session.amount_total / 100).toFixed(2) : '—'
  const currency = (session.currency || 'usd').toUpperCase()
  const email = session.customer_details?.email || session.customer_email || '—'
  const name = session.customer_details?.name || '—'

  // Telegram
  if (token && chatId) {
    const lines = [
      '✅ *Payment received*',
      '',
      `*Package:* ${m.package || '—'}`,
      `*Amount:* ${amount} ${currency}`,
      '',
      '*Client*',
      `• Name: ${name}`,
      `• Email: ${email}`,
      `• Brand: ${m.brand || '—'}`,
      ...(m.offer ? [`• Offer: ${m.offer}`] : []),
      `• Product: ${m.product_url || '—'}`,
      ...(m.services ? ['', '*Services*', m.services] : []),
      ...(m.notes ? ['', '*Notes*', m.notes] : []),
    ]
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'Markdown' }),
      })
    } catch { /* best effort */ }
  }

  // Email via Resend
  const resendKey = process.env.RESEND_API_KEY
  const orderEmail = process.env.ORDER_EMAIL || 'hello@rexran.com'
  const fromEmail = process.env.ORDER_FROM || 'Rexran Orders <onboarding@resend.dev>'
  if (resendKey) {
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
      <h2 style="margin:0 0 4px">✅ Payment received</h2>
      <p style="margin:0 0 16px;color:#666">${m.package || '—'} · ${amount} ${currency}</p>
      <table style="border-collapse:collapse;width:100%;max-width:520px">
        <tr><td style="padding:4px 0;color:#666;width:120px">Name</td><td style="padding:4px 0">${name}</td></tr>
        <tr><td style="padding:4px 0;color:#666">Email</td><td style="padding:4px 0">${email}</td></tr>
        <tr><td style="padding:4px 0;color:#666">Brand</td><td style="padding:4px 0">${m.brand || '—'}</td></tr>
        ${m.offer ? `<tr><td style="padding:4px 0;color:#666">Offer</td><td style="padding:4px 0">${m.offer}</td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#666">Product</td><td style="padding:4px 0">${m.product_url || '—'}</td></tr>
      </table>
      ${m.services ? `<h3 style="margin:18px 0 6px">Services</h3><p style="margin:0">${m.services}</p>` : ''}
      ${m.notes ? `<h3 style="margin:18px 0 6px">Notes</h3><p style="margin:0;white-space:pre-wrap">${m.notes}</p>` : ''}
    </div>`
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: fromEmail,
          to: [orderEmail],
          reply_to: email !== '—' ? email : undefined,
          subject: `Payment received — ${m.package || 'Rexran'} (${amount} ${currency})`,
          html,
        }),
      })
    } catch { /* best effort */ }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const raw = await readRawBody(req)
  const sig = req.headers['stripe-signature']

  // Verify the event genuinely came from Stripe
  if (webhookSecret) {
    if (!verifyStripeSignature(raw, sig, webhookSecret)) {
      // Diagnostic detail (safe — reveals no secret) to explain the 400 in Stripe logs
      const hasSecret = !!webhookSecret
      const secretPrefix = webhookSecret ? webhookSecret.slice(0, 8) : 'none'
      const hasSig = !!sig
      return res.status(400).json({
        error: 'Signature verification failed',
        debug: { hasSecret, secretPrefix, hasSig, bodyLength: raw.length },
      })
    }
  } else {
    return res.status(400).json({ error: 'STRIPE_WEBHOOK_SECRET is not set on the server' })
  }

  let event
  try {
    event = JSON.parse(raw.toString('utf8'))
  } catch {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    // Only record/notify for genuinely paid sessions
    if (session.payment_status === 'paid') {
      const isNewOrder = await saveOrder(session)
      // Skip re-notifying if Stripe redelivered an event we already recorded
      if (isNewOrder) await notify(session)
    }
  }

  // Always acknowledge quickly so Stripe doesn't retry
  return res.status(200).json({ received: true })
}
