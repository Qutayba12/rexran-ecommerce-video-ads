import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import './delivery.css'
import RexMark from './RexMark'

type FileItem = { url: string; name: string; type: string }
type Delivery = { client: string; note: string; files: FileItem[]; createdAt: number | null }

const isImage = (u: string) => /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(u)
const isVideo = (u: string) => /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(u)

// Vercel Blob forces a real download (not in-browser view) when ?download=1 is added.
// This works even cross-origin, where the HTML `download` attribute is ignored.
const forceDownloadUrl = (u: string) => (u.includes('?') ? `${u}&download=1` : `${u}?download=1`)

function Delivery() {
  const [state, setState] = useState<'loading' | 'ok' | 'notfound' | 'error'>('loading')
  const [data, setData] = useState<Delivery | null>(null)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
      || window.location.pathname.split('/').filter(Boolean).pop()
    if (!id || id === 'delivery') { setState('notfound'); return }
    fetch(`/api/delivery?id=${encodeURIComponent(id)}`)
      .then((r) => {
        if (r.status === 404) { setState('notfound'); return null }
        if (!r.ok) { setState('error'); return null }
        return r.json()
      })
      .then((d) => { if (d) { setData(d); setState('ok') } })
      .catch(() => setState('error'))
  }, [])

  const downloadAll = () => {
    if (!data) return
    data.files.forEach((f, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = forceDownloadUrl(f.url)
        document.body.appendChild(a)
        a.click()
        a.remove()
      }, i * 500)
    })
  }

  return (
    <div className="dl">
      <header className="dl-head">
        <a className="dl-brand" href="/"><RexMark className="dl-logo" />Rexran</a>
      </header>

      <main className="dl-main">
        {state === 'loading' && <p className="dl-status">Loading your delivery…</p>}

        {state === 'notfound' && (
          <div className="dl-empty">
            <div className="dl-kicker">Delivery</div>
            <h1>This link isn't available.</h1>
            <p>The delivery link may be incorrect or has been removed. Please check the link, or reach us at <a href="mailto:hello@rexran.com">hello@rexran.com</a>.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="dl-empty">
            <h1>Something went wrong.</h1>
            <p>Please refresh, or contact <a href="mailto:hello@rexran.com">hello@rexran.com</a>.</p>
          </div>
        )}

        {state === 'ok' && data && (
          <>
            <div className="dl-kicker">Your creative is ready</div>
            <h1>{data.client ? `${data.client}, your ads have landed.` : 'Your ads have landed.'}</h1>
            {data.note && <p className="dl-note">{data.note}</p>}

            <div className="dl-actions">
              <button className="cta" onClick={downloadAll}>Download all ({data.files.length})</button>
            </div>

            <div className="dl-grid">
              {data.files.map((f, i) => (
                <div className="dl-card" key={i}>
                  <div className="dl-preview">
                    {isImage(f.url) ? (
                      <img src={f.url} alt={f.name} loading="lazy" />
                    ) : isVideo(f.url) ? (
                      <video src={f.url} controls preload="metadata" playsInline />
                    ) : (
                      <div className="dl-file-icon">FILE</div>
                    )}
                  </div>
                  <div className="dl-card-foot">
                    <span className="dl-name">{f.name}</span>
                    <a className="dl-dl" href={forceDownloadUrl(f.url)}>Download</a>
                  </div>
                </div>
              ))}
            </div>

            <p className="dl-help">Questions or need a tweak? Reply to our email or reach us at <a href="mailto:hello@rexran.com">hello@rexran.com</a>.</p>
          </>
        )}
      </main>

      <footer className="dl-foot">© {new Date().getFullYear()} Rexran — AI-Directed Ad Studio</footer>
    </div>
  )
}

createRoot(document.getElementById('delivery-root')!).render(<Delivery />)
