// Vercel Serverless Function — receives a contact-form message and sends it
// to Telegram + email. Real orders are notified via the Stripe webhook, only
// after payment succeeds — see api/stripe-webhook.js.
import { limitRequest } from './_lib/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!(await limitRequest(req, 'contact', 5, 10 * 60))) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return res.status(500).json({ error: 'Telegram not configured' })
  }

  try {
    const o = req.body || {}

    const text = [
      '✉️ *New Contact Message*',
      '',
      '*From*',
      `• Name: ${o.brand || '—'}`,
      `• Email: ${o.email || '—'}`,
      '',
      '*Message*',
      o.notes || '—',
    ].join('\n')

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })

    if (!tgRes.ok) {
      const err = await tgRes.text()
      return res.status(502).json({ error: 'Telegram send failed', detail: err })
    }

    // Also email the message to the studio inbox (best-effort — never blocks the send)
    const resendKey = process.env.RESEND_API_KEY
    const orderEmail = process.env.ORDER_EMAIL || 'hello@rexran.com'
    const fromEmail = process.env.ORDER_FROM || 'Rexran Orders <onboarding@resend.dev>'
    if (resendKey) {
      try {
        const htmlBody = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
          <h2 style="margin:0 0 12px">✉️ New Contact Message</h2>
          <table style="border-collapse:collapse;width:100%;max-width:520px">
            <tr><td style="padding:4px 0;color:#666;width:120px">Name</td><td style="padding:4px 0">${o.brand || '—'}</td></tr>
            <tr><td style="padding:4px 0;color:#666">Email</td><td style="padding:4px 0">${o.email || '—'}</td></tr>
          </table>
          <h3 style="margin:18px 0 6px">Message</h3>
          <p style="margin:0;white-space:pre-wrap">${o.notes || '—'}</p>
        </div>`
        const mailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: fromEmail,
            to: [orderEmail],
            reply_to: o.email || undefined,
            subject: `New contact message — ${o.brand || 'Rexran'}`,
            html: htmlBody,
          }),
        })
        const mailData = await mailRes.json().catch(() => ({}))
        if (!mailRes.ok) {
          // Surface the email error in the response (message still sent via Telegram)
          return res.status(200).json({ ok: true, email: 'failed', emailError: mailData })
        }
        return res.status(200).json({ ok: true, email: 'sent', emailId: mailData.id })
      } catch (e) {
        return res.status(200).json({ ok: true, email: 'failed', emailError: String(e) })
      }
    }

    return res.status(200).json({ ok: true, email: 'skipped (no RESEND_API_KEY)' })
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) })
  }
}
