import { useEffect, useState } from 'react'
import RexMark from './RexMark'

type FileItem = { url: string; name: string; type: string; label?: string }
type Delivery = { client: string; note: string; files: FileItem[]; createdAt: number | null }

const isImage = (u: string) => /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(u)
const isVideo = (u: string) => /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(u)

// Vercel Blob forces a real download (not in-browser view) when ?download=1 is added.
// This works even cross-origin, where the HTML `download` attribute is ignored.
const forceDownloadUrl = (u: string) => (u.includes('?') ? `${u}&download=1` : `${u}?download=1`)

function getDeliveryId() {
  return new URLSearchParams(window.location.search).get('id')
    || window.location.pathname.split('/').filter(Boolean).pop()
}

// Cursor-driven 3D tilt + a glow that tracks the pointer — real pointer
// devices only (see the matching @media (hover: hover) guard in delivery.css),
// so touch never gets stuck mid-tilt.
function tiltCard(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width - 0.5
  const py = (e.clientY - r.top) / r.height - 0.5
  el.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`)
  el.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`)
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
function resetTilt(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg')
  e.currentTarget.style.setProperty('--ry', '0deg')
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}

export default function Delivery() {
  // Resolve the id synchronously during render (lazy initializer) so the
  // "no id" case never needs a setState call inside the effect body.
  const [state, setState] = useState<'loading' | 'ok' | 'notfound' | 'error'>(() => {
    const id = getDeliveryId()
    return (!id || id === 'delivery') ? 'notfound' : 'loading'
  })
  const [data, setData] = useState<Delivery | null>(null)
  const [lightbox, setLightbox] = useState<FileItem | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = getDeliveryId()
    if (!id || id === 'delivery') return // already resolved to 'notfound' above
    fetch(`/api/delivery?id=${encodeURIComponent(id)}`)
      .then((r) => {
        if (r.status === 404) { setState('notfound'); return null }
        if (!r.ok) { setState('error'); return null }
        return r.json()
      })
      .then((d) => { if (d) { setData(d); setState('ok') } })
      .catch(() => setState('error'))
  }, [])

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }

  return (
    <div className="dl">
      <header className="dl-head">
        <a className="dl-brand" href="/"><RexMark className="dl-logo" />Rexran</a>
      </header>

      <main className="dl-main">
        {state === 'loading' && (
          <div className="dl-loading">
            <div className="dl-spinner" />
            <p className="dl-status">Preparing your delivery…</p>
          </div>
        )}

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
            <p>Please try again, or contact <a href="mailto:hello@rexran.com">hello@rexran.com</a>.</p>
            <button className="cta ghost dl-retry" onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}

        {state === 'ok' && data && (
          <>
            <div className="dl-kicker-row">
              <div className="dl-kicker">Your creative is ready</div>
              <button className="dl-copy" onClick={copyLink}>{copied ? 'Link copied ✓' : 'Copy link'}</button>
            </div>
            <h1>{data.client ? `${data.client}, your ads have landed.` : 'Your ads have landed.'}</h1>
            {data.note && <p className="dl-note">{data.note}</p>}
            <p className="dl-count">{data.files.length} file{data.files.length !== 1 ? 's' : ''} ready to run</p>

            <div className="dl-grid" style={{ marginTop: 40 }}>
              {data.files.map((f, i) => {
                const media = isImage(f.url) || isVideo(f.url)
                return (
                  <div className="dl-card" key={i} style={{ animationDelay: `${i * 0.07}s` }} onMouseMove={tiltCard} onMouseLeave={resetTilt}>
                    <div className="glow" />
                    <div className="dl-preview">
                      {isImage(f.url) ? (
                        <img src={f.url} alt={f.label || f.name} loading="lazy" />
                      ) : isVideo(f.url) ? (
                        <video src={`${f.url}#t=0.1`} controls preload="metadata" playsInline />
                      ) : (
                        <div className="dl-file-icon">FILE</div>
                      )}
                      {media && (
                        <button className="dl-expand" aria-label="Expand preview" onClick={() => setLightbox(f)}>
                          <ExpandIcon />
                        </button>
                      )}
                    </div>
                    <div className="dl-card-foot">
                      <span className="dl-name">{f.label || f.name}</span>
                      <a className="dl-dl" href={forceDownloadUrl(f.url)}>Download</a>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="dl-help">Questions or need a tweak? Reply to our email or reach us at <a href="mailto:hello@rexran.com">hello@rexran.com</a>.</p>
          </>
        )}
      </main>

      <footer className="dl-foot">© {new Date().getFullYear()} Rexran — AI-Directed Ad Studio</footer>

      {lightbox && (
        <div className="modal-back dl-lightbox-back" onClick={() => setLightbox(null)}>
          <div className="dl-lightbox" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
            {isImage(lightbox.url) ? (
              <img src={lightbox.url} alt={lightbox.label || lightbox.name} />
            ) : (
              <video src={lightbox.url} controls autoPlay playsInline />
            )}
            <div className="dl-lightbox-foot">
              <span>{lightbox.label || lightbox.name}</span>
              <a className="dl-dl" href={forceDownloadUrl(lightbox.url)}>Download</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
