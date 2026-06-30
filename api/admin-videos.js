// POST /api/admin-videos — protected: add or delete a portfolio video
// Body: { password, action: 'add'|'delete', video?: {...}, id? }
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const KEY = 'rexran:videos'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const adminPw = process.env.ADMIN_PASSWORD
  const { password, action, video, id } = req.body || {}

  if (!adminPw || password !== adminPw) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    let videos = (await redis.get(KEY)) || []

    if (action === 'add') {
      if (!video || !video.url) return res.status(400).json({ error: 'Missing video url' })
      const item = {
        id: Date.now().toString(),
        title: video.title || 'Untitled',
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
