import { useEffect, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import './admin.css'
import RexMark from './RexMark'

type Video = { id: string; title: string; url: string; type: string; poster?: string }
const TYPES = ['UGC', 'Static', 'Cinematic', 'Photoshoot', 'Campaign']

function Admin() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
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

  useEffect(() => { loadVideos() }, [])

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
  type DFile = { url: string; name: string; type: string }
  type DeliveryT = { id: string; client: string; note: string; files: DFile[]; createdAt: number }
  const [deliveries, setDeliveries] = useState<DeliveryT[]>([])
  const [dClient, setDClient] = useState('')
  const [dNote, setDNote] = useState('')
  const [dFiles, setDFiles] = useState<DFile[]>([])
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

  const uploadDeliveryFile = async (file: File) => {
    setDErr(''); setDUploading(true); setDPct(0)
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ password: pw }),
        onUploadProgress: (p) => setDPct(Math.round(p.percentage)),
      })
      setDFiles((prev) => [...prev, { url: blob.url, name: file.name, type: file.type }])
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
      <section className="adm-section">
        <h2>Client deliveries ({deliveries.length})</h2>
        <p className="adm-empty" style={{ marginTop: -6, marginBottom: 20 }}>Upload a client's finished files, create a delivery, then send them the private link.</p>

        <div className="adm-upload">
          <label className="adm-drop">
            <input type="file" style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && uploadDeliveryFile(e.target.files[0])} disabled={dUploading} />
            {dUploading ? (
              <div className="adm-prog"><div className="adm-prog-bar" style={{ width: `${dPct}%` }} /><span>Uploading… {dPct}%</span></div>
            ) : (
              <div className="adm-drop-in"><span className="adm-drop-plus">↑</span><strong>Upload a finished file for the client</strong><span className="adm-drop-hint">Add them one at a time · videos or images · up to 500MB each</span></div>
            )}
          </label>
        </div>

        {dFiles.length > 0 && (
          <div className="adm-dfiles">
            {dFiles.map((f, i) => (
              <div className="adm-dfile" key={i}>
                <span className="adm-dfile-name">✓ {f.name}</span>
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
    </div>
  )
}

createRoot(document.getElementById('admin-root')!).render(<Admin />)
