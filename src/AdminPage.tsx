import { useEffect, useState } from 'react'
import { upload } from '@vercel/blob/client'
import RexMark from './RexMark'

type Video = { id: string; title: string; url: string; type: string; poster?: string }
const TYPES = ['UGC', 'Static', 'Cinematic', 'Photoshoot', 'Campaign']

type WorkspaceView = 'hub' | 'videos' | 'deliveries'

// Follows the cursor position into --mx/--my so the .glow radial gradient
// tracks the pointer — same pattern used site-wide (see App.tsx's `tilt`).
const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function PortfolioIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="14" height="13" rx="2" />
      <path d="M16.5 10.3 21.5 7v10l-5-3.3" />
    </svg>
  )
}
function DeliveriesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 21 7.5v9L12 21 3 16.5v-9Z" />
      <path d="M3 7.5 12 12l9-4.5" />
      <path d="M12 12v9" />
    </svg>
  )
}

export default function Admin() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [view, setView] = useState<WorkspaceView>('hub')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const [url, setUrl] = useState('')
  const [type, setType] = useState('UGC')
  const [poster, setPoster] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)

  const uploadFile = async (file: File) => {
    setErr(''); setUploading(true); setUploadPct(0)
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ password: pw }),
        onUploadProgress: (p) => setUploadPct(Math.round(p.percentage)),
      })
      setUploadPct(100)
      setUrl(blob.url)
    } catch (e) {
      setErr('Upload failed: ' + String(e instanceof Error ? e.message : e))
    } finally {
      setUploading(false)
    }
  }

  const loadVideos = async () => {
    try {
      const r = await fetch('/api/videos')
      const d = await r.json()
      setVideos(d.videos || [])
    } catch { /* ignore */ }
  }

  // Fetch-on-mount: an inline async IIFE with an "ignore" cancellation flag,
  // the pattern React's docs recommend for effects that fetch data, so the
  // setState call is a callback response to the fetch — never synchronous
  // within the effect body itself.
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const r = await fetch('/api/videos')
        const d = await r.json()
        if (!ignore) setVideos(d.videos || [])
      } catch { /* ignore */ }
    })()
    return () => { ignore = true }
  }, [])

  const tryLogin = async () => {
    setErr(''); setLoading(true)
    try {
      // validate password by attempting a harmless add-less call: we use a delete with no id
      const r = await fetch('/api/admin-videos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, action: 'delete', id: '__none__' }),
      })
      if (r.status === 401) { setErr('Wrong password.'); setLoading(false); return }
      setAuthed(true)
      await loadVideos()
      await loadDeliveries(pw)
      await loadOrders(pw)
    } catch {
      setErr('Could not connect. Try again.')
    } finally { setLoading(false) }
  }

  const addVideo = async () => {
    if (!url.trim()) { setErr('Add a video URL.'); return }
    setErr(''); setLoading(true)
    try {
      const r = await fetch('/api/admin-videos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, action: 'add', video: { url, type, poster } }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'failed')
      setVideos(d.videos)
      setUrl(''); setPoster(''); setType('UGC')
    } catch (e) {
      setErr('Could not add. ' + String(e))
    } finally { setLoading(false) }
  }

  const removeVideo = async (id: string) => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin-videos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, action: 'delete', id }),
      })
      const d = await r.json()
      if (r.ok) setVideos(d.videos)
    } finally { setLoading(false) }
  }

  // ---- DELIVERIES ----
  type DFile = { url: string; name: string; type: string; label: string }
  type DeliveryT = { id: string; client: string; note: string; files: DFile[]; createdAt: number }
  const DELIVERY_LABELS = ['UGC Video Ad', 'Cinematic Film', 'Static Ad Image', 'Product Photoshoot', 'Campaign Asset']
  const [deliveries, setDeliveries] = useState<DeliveryT[]>([])
  const [dClient, setDClient] = useState('')
  const [dNote, setDNote] = useState('')
  const [dFiles, setDFiles] = useState<DFile[]>([])
  const [dLabel, setDLabel] = useState(DELIVERY_LABELS[0])
  const [dUploading, setDUploading] = useState(false)
  const [dPct, setDPct] = useState(0)
  const [dErr, setDErr] = useState('')
  const [copiedId, setCopiedId] = useState('')

  const loadDeliveries = async (pwd: string) => {
    try {
      const r = await fetch('/api/deliveries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, action: 'list' }),
      })
      const d = await r.json()
      if (r.ok) setDeliveries(d.deliveries || [])
    } catch { /* ignore */ }
  }

  // ---- ORDERS (paid, recorded by the Stripe webhook) ----
  type OrderT = {
    id: string; package: string; amount: number | null; currency: string
    email: string; name: string; brand: string; offer: string; productUrl: string
    language: string; services: string; notes: string; createdAt: number
  }
  const [orders, setOrders] = useState<OrderT[]>([])
  const loadOrders = async (pwd: string) => {
    try {
      const r = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      const d = await r.json()
      if (r.ok) setOrders(d.orders || [])
    } catch { /* ignore */ }
  }

  const uploadDeliveryFile = async (file: File) => {
    setDErr(''); setDUploading(true); setDPct(0)
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ password: pw }),
        onUploadProgress: (p) => setDPct(Math.round(p.percentage)),
      })
      setDFiles((prev) => [...prev, { url: blob.url, name: file.name, type: file.type, label: dLabel }])
    } catch (e) {
      setDErr('Upload failed: ' + String(e instanceof Error ? e.message : e))
    } finally {
      setDUploading(false); setDPct(0)
    }
  }

  const createDelivery = async () => {
    if (dFiles.length === 0) { setDErr('Upload at least one file.'); return }
    setDErr(''); setLoading(true)
    try {
      const r = await fetch('/api/deliveries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, action: 'create', delivery: { client: dClient, note: dNote, files: dFiles } }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'failed')
      setDeliveries(d.deliveries)
      setDClient(''); setDNote(''); setDFiles([])
    } catch (e) {
      setDErr('Could not create. ' + String(e))
    } finally { setLoading(false) }
  }

  const removeDelivery = async (id: string) => {
    setLoading(true)
    try {
      const r = await fetch('/api/deliveries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, action: 'delete', id }),
      })
      const d = await r.json()
      if (r.ok) setDeliveries(d.deliveries)
    } finally { setLoading(false) }
  }

  const copyLink = (id: string) => {
    // Always use the public domain so delivery links never point to the SSO-protected *.vercel.app host
    const origin = window.location.hostname.endsWith('rexran.com') ? window.location.origin : 'https://rexran.com'
    const link = `${origin}/delivery/${id}`
    navigator.clipboard?.writeText(link).then(() => {
      setCopiedId(id); setTimeout(() => setCopiedId(''), 1800)
    }).catch(() => {})
  }

  if (!authed) {
    return (
      <div className="adm-gate">
        <div className="adm-card">
          <RexMark className="adm-logo" />
          <h1>Rexran Admin</h1>
          <p>Enter your password to manage portfolio videos.</p>
          <input type="password" value={pw} placeholder="Password"
            onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && tryLogin()} />
          {err && <div className="adm-err">{err}</div>}
          <button className="cta" onClick={tryLogin} disabled={loading}>{loading ? 'Checking…' : 'Enter'}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="adm-wrap">
      <header className="adm-head">
        <div className="brand" style={{ color: 'var(--gold)' }}><RexMark className="brand-logo" />Rexran Admin</div>
        <a className="cta ghost" href="/">View site →</a>
      </header>

      {view === 'hub' && (
        <div className="adm-hub">
          <div className="adm-hub-head">
            <h1>What are we doing today?</h1>
            <p>Pick a workspace to continue.</p>
          </div>
          <div className="adm-hub-grid">
            <div className="adm-hub-card" onMouseMove={tilt} onClick={() => setView('videos')}
              role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setView('videos')}>
              <div className="glow" />
              <div className="adm-hub-icon"><PortfolioIcon /></div>
              <h2>Portfolio</h2>
              <p className="adm-hub-desc">Publish and manage the videos and photos shown on the site.</p>
              <div className="adm-hub-stats"><span>{videos.length} live</span></div>
              <span className="adm-hub-go">Open workspace →</span>
            </div>
            <div className="adm-hub-card" onMouseMove={tilt} onClick={() => setView('deliveries')}
              role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setView('deliveries')}>
              <div className="glow" />
              <div className="adm-hub-icon"><DeliveriesIcon /></div>
              <h2>Client Deliveries</h2>
              <p className="adm-hub-desc">Review paid orders and hand finished files off to clients.</p>
              <div className="adm-hub-stats"><span>{orders.length} orders</span><span>{deliveries.length} deliveries</span></div>
              <span className="adm-hub-go">Open workspace →</span>
            </div>
          </div>
        </div>
      )}

      {view === 'videos' && (
      <>
      <button className="adm-back" onClick={() => setView('hub')}>← Back to hub</button>
      <section className="adm-section">
        <h2>Add a video</h2>
        <div className="adm-upload">
          <label className="adm-drop">
            <input type="file" accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp" style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} disabled={uploading} />
            {uploading ? (
              <div className="adm-prog"><div className="adm-prog-bar" style={{ width: `${uploadPct}%` }} /><span>Uploading… {uploadPct}%</span></div>
            ) : (
              <div className="adm-drop-in"><span className="adm-drop-plus">↑</span><strong>Upload a video or image from your device</strong><span className="adm-drop-hint">MP4, MOV, WebM or images · up to 500MB</span></div>
            )}
          </label>
          {url && !uploading && <div className="adm-uploaded">✓ Video ready — fill in the details below and click Add video.</div>}
        </div>
        <div className="adm-or">or paste a link</div>
        <div className="adm-form">
          <div className="field"><label>Media URL (video mp4 or image)</label><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/video.mp4" /></div>
          <div className="field"><label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="field"><label>Poster image URL (optional)</label><input value={poster} onChange={(e) => setPoster(e.target.value)} placeholder="https://…/thumb.jpg" /></div>
        </div>
        {err && <div className="adm-err">{err}</div>}
        <button className="cta" onClick={addVideo} disabled={loading}>{loading ? 'Saving…' : 'Add video'}</button>
      </section>

      <section className="adm-section">
        <h2>Your videos ({videos.length})</h2>
        {videos.length === 0 && <p className="adm-empty">No videos yet. Add your first one above.</p>}
        <div className="adm-list">
          {videos.map((v) => (
            <div className="adm-item" key={v.id}>
              <div className="adm-thumb">
                {v.poster ? <img src={v.poster} alt="" /> : <span>{v.type}</span>}
              </div>
              <div className="adm-meta">
                <strong>{v.type}</strong>
                <a href={v.url} target="_blank" rel="noreferrer" className="adm-url">{v.url}</a>
              </div>
              <button className="adm-del" onClick={() => removeVideo(v.id)} disabled={loading}>Delete</button>
            </div>
          ))}
        </div>
      </section>
      </>
      )}

      {view === 'deliveries' && (
      <>
      <button className="adm-back" onClick={() => setView('hub')}>← Back to hub</button>
      <section className="adm-section">
        <h2>Orders ({orders.length})</h2>
        <p className="adm-empty" style={{ marginTop: -6, marginBottom: 20 }}>Every payment confirmed by Stripe is recorded here, even if the Telegram/email alert fails to send.</p>
        {orders.length === 0 && <p className="adm-empty">No paid orders yet.</p>}
        <div className="adm-list">
          {orders.map((o) => (
            <div className="adm-item" key={o.id}>
              <div className="adm-meta">
                <strong>{o.package || 'Order'} · {o.amount != null ? `$${o.amount.toFixed(2)}` : '—'} {o.currency}</strong>
                <span className="adm-url">{o.brand || '—'} · {o.email || '—'} · {new Date(o.createdAt).toLocaleString()}</span>
                {o.services && <span className="adm-url">{o.services}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="adm-section">
        <h2>Client deliveries ({deliveries.length})</h2>
        <p className="adm-empty" style={{ marginTop: -6, marginBottom: 20 }}>Upload a client's finished files, create a delivery, then send them the private link.</p>

        <div className="adm-form" style={{ marginBottom: 14 }}>
          <div className="field"><label>Service type for the next file</label>
            <select value={dLabel} onChange={(e) => setDLabel(e.target.value)}>{DELIVERY_LABELS.map((l) => <option key={l}>{l}</option>)}</select>
          </div>
        </div>

        <div className="adm-upload">
          <label className="adm-drop">
            <input type="file" style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && uploadDeliveryFile(e.target.files[0])} disabled={dUploading} />
            {dUploading ? (
              <div className="adm-prog"><div className="adm-prog-bar" style={{ width: `${dPct}%` }} /><span>Uploading… {dPct}%</span></div>
            ) : (
              <div className="adm-drop-in"><span className="adm-drop-plus">↑</span><strong>Upload a finished file for the client</strong><span className="adm-drop-hint">Pick the service type above · one file at a time · up to 500MB each</span></div>
            )}
          </label>
        </div>

        {dFiles.length > 0 && (
          <div className="adm-dfiles">
            {dFiles.map((f, i) => (
              <div className="adm-dfile" key={i}>
                <span className="adm-dfile-name">✓ <strong style={{ color: 'var(--gold)' }}>{f.label}</strong> · {f.name}</span>
                <button className="adm-del" onClick={() => setDFiles((prev) => prev.filter((_, idx) => idx !== i))}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="adm-form" style={{ marginTop: 18 }}>
          <div className="field"><label>Client / brand name (optional)</label><input value={dClient} onChange={(e) => setDClient(e.target.value)} placeholder="Acme Supply Co." /></div>
          <div className="field"><label>Short note to the client (optional)</label><input value={dNote} onChange={(e) => setDNote(e.target.value)} placeholder="Here are your 3 UGC ads, ready to run. Enjoy!" /></div>
        </div>
        {dErr && <div className="adm-err">{dErr}</div>}
        <button className="cta" onClick={createDelivery} disabled={loading || dFiles.length === 0}>{loading ? 'Creating…' : 'Create delivery link'}</button>

        <div className="adm-list" style={{ marginTop: 28 }}>
          {deliveries.map((d) => (
            <div className="adm-item" key={d.id}>
              <div className="adm-meta">
                <strong>{d.client || 'Delivery'} · {d.files.length} file{d.files.length !== 1 ? 's' : ''}</strong>
                <span className="adm-url">/delivery/{d.id}</span>
              </div>
              <button className="cta ghost" style={{ padding: '9px 14px', fontSize: 12 }} onClick={() => copyLink(d.id)}>{copiedId === d.id ? 'Copied ✓' : 'Copy link'}</button>
              <button className="adm-del" onClick={() => removeDelivery(d.id)} disabled={loading}>Delete</button>
            </div>
          ))}
        </div>
      </section>
      </>
      )}
    </div>
  )
}
