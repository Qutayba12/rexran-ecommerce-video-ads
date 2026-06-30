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

    // Build a clean, readable message
    const lines = []
    lines.push('🎬 *New Rexran Order*')
    lines.push('')
    lines.push(`*Package:* ${o.package || '—'}`)
    if (o.total) lines.push(`*Total:* $${o.total}`)
    lines.push('')
    lines.push('*Client*')
    lines.push(`• Brand: ${o.brand || '—'}`)
    lines.push(`• Product: ${o.productUrl || '—'}`)
    lines.push(`• Instagram: ${o.instagram || '—'}`)
    lines.push(`• Email: ${o.email || '—'}`)
    lines.push(`• Language: ${o.language || '—'}`)
    if (o.items && o.items.length) {
      lines.push('')
      lines.push('*Services & sizes*')
      o.items.forEach((it) => {
        const sizes = (it.ratios && it.ratios.length) ? it.ratios.join(', ') : 'any'
        const qty = it.qty ? `×${it.qty} ` : ''
        lines.push(`• ${qty}${it.label} — ${sizes}`)
      })
    }
    if (o.notes) {
      lines.push('')
      lines.push('*Notes*')
      lines.push(o.notes)
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

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) })
  }
}
