// Studio page hero: shows ONE prominent piece of work at the top of /studio,
// pulled from the same admin-managed /api/videos feed as the homepage Work
// section — so it's controlled from the admin panel with no extra storage.
// Prefers the newest actual video, falling back to the newest image. The block
// stays hidden whenever there's nothing to show, so the page never renders an
// empty media frame. CSP forbids inline scripts (script-src 'self'), so this
// ships as a bundled module rather than an inline <script>.

type Media = { id: string; url: string; type?: string; poster?: string }

const isImage = (u: string) => /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(u)

async function mount() {
  const fig = document.getElementById('studio-hero')
  const frame = document.getElementById('studio-hero-frame')
  const cap = document.getElementById('studio-hero-cap')
  if (!fig || !frame || !cap) return

  try {
    const res = await fetch('/api/videos')
    if (!res.ok) return
    const data = await res.json()
    const items: Media[] = Array.isArray(data?.videos) ? data.videos : []
    if (!items.length) return

    // Newest real video, or newest image if there are no videos.
    const featured = items.find((m) => m.url && !isImage(m.url)) || items.find((m) => m.url)
    if (!featured?.url) return

    if (isImage(featured.url)) {
      const img = document.createElement('img')
      img.src = featured.url
      img.alt = `${featured.type ? featured.type + ' ' : ''}ad creative produced by Rexran`
      img.loading = 'eager'
      frame.appendChild(img)
      frame.classList.add('is-photo')
    } else {
      const v = document.createElement('video')
      v.src = featured.url
      if (featured.poster) v.poster = featured.poster
      v.muted = true
      v.loop = true
      v.autoplay = true
      v.playsInline = true
      v.setAttribute('playsinline', '')
      v.preload = 'metadata'
      frame.appendChild(v)
      v.play().catch(() => {})
    }

    cap.textContent = featured.type || 'From the studio'
    fig.hidden = false
  } catch {
    /* any failure: leave the block hidden */
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
