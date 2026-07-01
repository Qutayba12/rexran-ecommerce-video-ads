// POST /api/upload — issues a secure client-upload token for Vercel Blob.
// No onUploadCompleted: the admin UI itself saves the returned URL, so we don't
// need Vercel to call us back (that callback is what stalls the browser at ~98%).
import { handleUpload } from '@vercel/blob/client'

const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  Object.keys(process.env).filter((k) => k.includes('BLOB') && k.includes('READ_WRITE')).map((k) => process.env[k])[0]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!blobToken) return res.status(500).json({ error: 'Blob store not connected. Connect rexran-blob and redeploy.' })

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
      // deliberately NO onUploadCompleted — avoids the callback that stalls the client
    })
    return res.status(200).json(jsonResponse)
  } catch (e) {
    return res.status(400).json({ error: String(e instanceof Error ? e.message : e) })
  }
}
