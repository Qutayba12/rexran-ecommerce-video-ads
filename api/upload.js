// POST /api/upload — server upload: the browser sends the raw file bytes,
// we stream them straight into Vercel Blob and return the public URL.
// No client tokens, no multipart handshake, no completion callback — nothing that can hang.
import { put } from '@vercel/blob'

// Let us read the raw request stream ourselves (no body parsing/limit games).
export const config = { api: { bodyParser: false } }

const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  Object.keys(process.env).filter((k) => k.includes('BLOB') && k.includes('READ_WRITE')).map((k) => process.env[k])[0]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!blobToken) return res.status(500).json({ error: 'Blob store not connected. Connect rexran-blob and redeploy.' })

  // auth via header (body is the raw file, so we can't put the password in it)
  const pw = req.headers['x-admin-password']
  if (!process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const rawName = (req.headers['x-filename'] || 'upload').toString()
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const contentType = (req.headers['content-type'] || 'application/octet-stream').toString()

  try {
    // Read the whole request body into a buffer, then store it.
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    if (!buffer.length) return res.status(400).json({ error: 'Empty upload' })

    const blob = await put(`media/${Date.now()}-${safeName}`, buffer, {
      access: 'public',
      contentType,
      token: blobToken,
      addRandomSuffix: true,
    })

    return res.status(200).json({ url: blob.url })
  } catch (e) {
    return res.status(500).json({ error: String(e instanceof Error ? e.message : e) })
  }
}
