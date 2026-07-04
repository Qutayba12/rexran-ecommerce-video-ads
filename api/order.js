// Vercel Serverless Function — receives an order and sends it to Telegram
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return res.status(500).json({ error: 'Telegram not configured' })
  }

  try {
    const o = req.body || {}
    const isContact = o.package === 'Contact message'

    // Build a clean, readable message
    const lines = []
    if (isContact) {
      lines.push('✉️ *New Contact Message*')
      lines.push('')
      lines.push('*From*')
      lines.push(`• Name: ${o.brand || '—'}`)
      lines.push(`• Email: ${o.email || '—'}`)
      lines.push('')
      lines.push('*Message*')
      lines.push(o.notes || '—')
    } else {
      lines.push('🎬 *New Rexran Order*')
      lines.push('')
      lines.push(`*Package:* ${o.package || '—'}`)
      if (o.total) lines.push(`*Total:* $${o.total}`)
      lines.push('')
      lines.push('*Client*')
      lines.push(`• Brand: ${o.brand || '—'}`)
      lines.push(`• Product: ${o.productUrl || '—'}`)
      if (o.offer) lines.push(`• Offer: ${o.offer}`)
      lines.push(`• Email: ${o.email || '—'}`)
      lines.push(`• Language: ${o.language || '—'}`)
      if (o.items && o.items.length) {
        lines.push('')
        lines.push('*Services & sizes*')
        o.items.forEach((it) => {
          const sizes = (it.ratios && it.ratios.length) ? it.ratios.join(', ') : 'any'
          const qty = it.qty ? `×${it.qty} ` : ''
          const dur = it.duration ? ` ${it.duration}` : ''
          lines.push(`• ${qty}${it.label}${dur} — ${sizes}`)
        })
      }
      if (o.notes) {
        lines.push('')
        lines.push('*Notes*')
        lines.push(o.notes)
      }
    }

    const text = lines.join('\n')

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })

    if (!tgRes.ok) {
      const err = await tgRes.text()
      return res.status(502).json({ error: 'Telegram send failed', detail: err })
    }

    // Also email the order to the studio inbox (best-effort — never blocks the order)
    const resendKey = process.env.RESEND_API_KEY
    const orderEmail = process.env.ORDER_EMAIL || 'hello@rexran.com'
    const fromEmail = process.env.ORDER_FROM || 'Rexran Orders <onboarding@resend.dev>'
    if (resendKey) {
      try {
        const htmlBody = isContact ? `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
          <h2 style="margin:0 0 12px">✉️ New Contact Message</h2>
          <table style="border-collapse:collapse;width:100%;max-width:520px">
            <tr><td style="padding:4px 0;color:#666;width:120px">Name</td><td style="padding:4px 0">${o.brand || '—'}</td></tr>
            <tr><td style="padding:4px 0;color:#666">Email</td><td style="padding:4px 0">${o.email || '—'}</td></tr>
          </table>
          <h3 style="margin:18px 0 6px">Message</h3>
          <p style="margin:0;white-space:pre-wrap">${o.notes || '—'}</p>
        </div>` : `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
          <h2 style="margin:0 0 4px">🎬 New Rexran Order</h2>
          <p style="margin:0 0 16px;color:#666">${o.package || '—'}${o.total ? ` · $${o.total}` : ''}</p>
          <table style="border-collapse:collapse;width:100%;max-width:520px">
            <tr><td style="padding:4px 0;color:#666;width:120px">Brand</td><td style="padding:4px 0">${o.brand || '—'}</td></tr>
            <tr><td style="padding:4px 0;color:#666">Product</td><td style="padding:4px 0">${o.productUrl || '—'}</td></tr>
            ${o.offer ? `<tr><td style="padding:4px 0;color:#666">Offer</td><td style="padding:4px 0">${o.offer}</td></tr>` : ""}
            <tr><td style="padding:4px 0;color:#666">Email</td><td style="padding:4px 0">${o.email || '—'}</td></tr>
            <tr><td style="padding:4px 0;color:#666">Language</td><td style="padding:4px 0">${o.language || '—'}</td></tr>
          </table>
          ${(o.items && o.items.length) ? `<h3 style="margin:18px 0 6px">Services &amp; sizes</h3><ul style="margin:0;padding-left:18px">${o.items.map((it) => { const sizes = (it.ratios && it.ratios.length) ? it.ratios.join(', ') : 'any'; const qty = it.qty ? `×${it.qty} ` : ''; const dur = it.duration ? ` ${it.duration}` : ''; return `<li>${qty}${it.label}${dur} — ${sizes}</li>` }).join('')}</ul>` : ''}
          ${o.notes ? `<h3 style="margin:18px 0 6px">Notes</h3><p style="margin:0;white-space:pre-wrap">${o.notes}</p>` : ''}
        </div>`
        const mailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: fromEmail,
            to: [orderEmail],
            reply_to: o.email || undefined,
            subject: isContact ? `New contact message — ${o.brand || 'Rexran'}` : `New order — ${o.package || 'Rexran'}${o.total ? ` ($${o.total})` : ''}`,
            html: htmlBody,
          }),
        })
        const mailData = await mailRes.json().catch(() => ({}))
        if (!mailRes.ok) {
          // Surface the email error in the response (order still succeeds via Telegram)
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
