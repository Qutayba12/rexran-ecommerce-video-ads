// POST /api/customer-upload — issues a Vercel Blob client-upload token so a
// customer's browser can upload product reference photos directly to Blob
// storage during checkout (bypasses the serverless body-size limit). Public
// and rate-limited instead of password-gated — unlike api/upload.js (admin
// only), a customer filling out the order form has no admin password.
import { handleUpload } from '@vercel/blob/client'
import { limitRequest } from './_lib/rateLimit.js'

const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  Object.keys(process.env).filter((k) => k.includes('BLOB') && k.includes('READ_WRITE')).map((k) => process.env[k])[0]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!blobToken) return res.status(500).json({ error: 'Blob store not connected.' })

  if (!(await limitRequest(req, 'customer-upload', 30, 10 * 60))) {
    return res.status(429).json({ error: 'Too many uploads. Please try again shortly.' })
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      token: blobToken,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 20 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      // NO onUploadCompleted — the order form saves the returned URL itself.
    })
    return res.status(200).json(jsonResponse)
  } catch (e) {
    return res.status(400).json({ error: String(e instanceof Error ? e.message : e) })
  }
}
