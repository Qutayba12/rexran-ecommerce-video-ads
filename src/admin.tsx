import { useEffect, useState } from 'react'
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

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState('UGC')
  const [poster, setPoster] = useState('')

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
        body: JSON.stringify({ password: pw, action: 'add', video: { title, url, type, poster } }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'failed')
      setVideos(d.videos)
      setTitle(''); setUrl(''); setPoster(''); setType('UGC')
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
        <div className="adm-form">
          <div className="field"><label>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Skincare UGC — Summer drop" /></div>
          <div className="field"><label>Video URL (mp4 / hosted link)</label><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/video.mp4" /></div>
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
                <strong>{v.title || 'Untitled'}</strong>
                <span className="adm-tag">{v.type}</span>
                <a href={v.url} target="_blank" rel="noreferrer" className="adm-url">{v.url}</a>
              </div>
              <button className="adm-del" onClick={() => removeVideo(v.id)} disabled={loading}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

createRoot(document.getElementById('admin-root')!).render(<Admin />)
