// POST /api/upload — issues a secure client-upload token so the browser uploads
// the file DIRECTLY to Vercel Blob (bypasses the 4.5MB serverless body limit).
// No onUploadCompleted callback (that's what stalled the browser previously).
import { handleUpload } from '@vercel/blob/client'
import { checkPassword } from './_lib/auth.js'
import { isBlockedByFailedAttempts, recordFailedAttempt } from './_lib/rateLimit.js'

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
        if (await isBlockedByFailedAttempts(req, 'admin', 10)) {
          throw new Error('Too many attempts. Try again later.')
        }
        if (!checkPassword(pw, process.env.ADMIN_PASSWORD)) {
          await recordFailedAttempt(req, 'admin', 15 * 60)
          throw new Error('Unauthorized')
        }
        return {
          // Accept any image or video type. Browsers (especially on Windows)
          // often report a file's MIME as "" or application/octet-stream, so an
          // exact allow-list silently rejected valid uploads client-side; the
          // wildcards + a client-side content-type guess (see AdminPage) fix that.
          allowedContentTypes: ['image/*', 'video/*'],
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
