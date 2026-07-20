// POST /api/admin-videos — protected: add or delete a portfolio video
// Body: { password, action: 'add'|'delete', video?: {...}, id? }
import { Redis } from '@upstash/redis'
import { checkPassword } from './_lib/auth.js'
import { isBlockedByFailedAttempts, recordFailedAttempt } from './_lib/rateLimit.js'

const redis = Redis.fromEnv()
const KEY = 'rexran:videos'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password, action, video, id } = req.body || {}

  if (await isBlockedByFailedAttempts(req, 'admin', 10)) {
    return res.status(429).json({ error: 'Too many attempts. Try again later.' })
  }
  if (!checkPassword(password, process.env.ADMIN_PASSWORD)) {
    await recordFailedAttempt(req, 'admin', 15 * 60)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    let videos = (await redis.get(KEY)) || []

    if (action === 'add') {
      if (!video || !video.url) return res.status(400).json({ error: 'Missing video url' })
      const item = {
        id: Date.now().toString(),
        url: video.url,
        type: video.type || 'UGC',
        poster: video.poster || '',
      }
      videos = [item, ...videos]
      await redis.set(KEY, videos)
      return res.status(200).json({ ok: true, videos })
    }

    if (action === 'delete') {
      videos = videos.filter((v) => v.id !== id)
      await redis.set(KEY, videos)
      return res.status(200).json({ ok: true, videos })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) })
  }
}
