// POST /api/upload — issues a secure client-upload token for Vercel Blob
// Protected: requires the admin password in the token-generation step.
import { handleUpload } from '@vercel/blob/client'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body
  const adminPw = process.env.ADMIN_PASSWORD

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // clientPayload carries the admin password from the browser
        let pw = ''
        try { pw = clientPayload ? JSON.parse(clientPayload).password : '' } catch { pw = '' }
        if (!adminPw || pw !== adminPw) {
          throw new Error('Unauthorized')
        }
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // nothing needed here — the admin UI saves the URL via /api/admin-videos
      },
    })
    return res.status(200).json(jsonResponse)
  } catch (e) {
    return res.status(400).json({ error: String(e instanceof Error ? e.message : e) })
  }
}
