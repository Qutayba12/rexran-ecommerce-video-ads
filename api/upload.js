// POST /api/upload — issues a secure client-upload token so the browser uploads
// the file DIRECTLY to Vercel Blob (bypasses the 4.5MB serverless body limit).
// No onUploadCompleted callback (that's what stalled the browser previously).
import { handleUpload } from '@vercel/blob/client'

const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  Object.keys(process.env).filter((k) => k.includes('BLOB') && k.includes('READ_WRITE')).map((k) => process.env[k])[0]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!blobToken) return res.status(500).json({ error: 'Blob store not connected. Connect the store and redeploy.' })

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      token: blobToken,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let pw = ''
        try { pw = clientPayload ? JSON.parse(clientPayload).password : '' } catch { pw = '' }
        if (!process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) {
          throw new Error('Unauthorized')
        }
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
      // NO onUploadCompleted — the admin UI saves the returned URL itself.
    })
    return res.status(200).json(jsonResponse)
  } catch (e) {
    return res.status(400).json({ error: String(e instanceof Error ? e.message : e) })
  }
}
