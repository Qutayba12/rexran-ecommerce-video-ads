// Rexran signature: the "Aperture" intro.
//
// On the first page view of a session, a full-screen dark cover irises open
// from the centre — like a camera lens stopping open — to reveal the site,
// with the gold Rexran mark inside a thin rotating aperture ring. It plays
// once per session, skips entirely for reduced-motion users, and fast-forwards
// on any interaction. Purely cosmetic: the real page is already rendered
// behind it, so it never affects LCP, SEO, or interactivity.
//
// Self-contained on purpose — it injects its own DOM + inline styles (CSP
// allows inline styles) so the exact same module works on the React homepage
// and on the static HTML pages, with no stylesheet edits. Animated with a
// single rAF loop over transform / opacity / mask only (compositor-friendly),
// so it stays cheap on mobile.

const SEEN_KEY = 'rx_aperture_seen'
const MOUNT_ID = 'rx-aperture'

// The Rexran "R" glyph, same path used across the site (RexMark / studio.html).
const R_PATH =
  'M3886 5808 c17 -18 111 -122 209 -232 162 -180 176 -199 159 -210 -102 -60 -369 -202 -404 -215 -40 -14 -194 -17 -1410 -21 -1199 -5 -1371 -8 -1415 -21 -57 -18 -127 -52 -168 -83 -26 -19 -305 -375 -635 -809 l-122 -162 1742 -5 c1743 -5 1743 -5 1816 -32 328 -119 468 -481 306 -789 -45 -86 -147 -185 -236 -228 -128 -63 -63 -61 -1620 -61 l-1418 0 0 -1425 0 -1425 550 0 550 0 0 920 0 920 404 0 404 0 214 -262 c118 -145 288 -355 379 -467 90 -112 274 -339 409 -505 135 -165 301 -370 369 -454 l123 -152 664 0 c365 0 664 2 664 5 0 3 -57 73 -128 157 -70 84 -227 275 -348 423 -121 149 -340 415 -485 591 -517 630 -611 745 -608 748 2 2 47 13 99 25 651 147 1120 783 1051 1424 -33 304 -193 600 -423 783 -37 30 -37 30 60 82 409 220 374 204 395 184 10 -9 112 -119 225 -244 114 -126 209 -228 213 -228 4 0 29 82 57 183 244 876 383 1384 412 1497 11 47 23 93 26 103 5 16 -50 17 -1052 17 -1058 0 -1058 0 -1028 -32z'

// Six aperture blade seams around the ring, rendered as thin gold lines.
function bladeSeams(): string {
  let out = ''
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const x1 = 100 + Math.cos(a) * 52
    const y1 = 100 + Math.sin(a) * 52
    const x2 = 100 + Math.cos(a) * 78
    const y2 = 100 + Math.sin(a) * 78
    out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>`
  }
  return out
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

function play() {
  const prefersReduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* private mode / storage blocked: still fine to play once */
  }
  if (document.getElementById(MOUNT_ID)) return

  // Dark cover with a circular transparent hole we grow from the centre.
  const cover = document.createElement('div')
  cover.id = MOUNT_ID
  cover.setAttribute('aria-hidden', 'true')
  cover.style.cssText =
    'position:fixed;inset:0;z-index:999;background:var(--bg,#07060a);pointer-events:none;' +
    'display:flex;align-items:center;justify-content:center;will-change:mask,-webkit-mask;'

  // Aperture ring + gold mark, centred inside the cover.
  const stage = document.createElement('div')
  stage.style.cssText =
    'width:min(38vw,190px);height:min(38vw,190px);display:grid;place-items:center;' +
    'will-change:transform,opacity;filter:drop-shadow(0 0 34px rgba(212,175,55,.35));'
  stage.innerHTML =
    `<svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" style="position:absolute" aria-hidden="true">` +
    `<g id="rx-ap-ring">` +
    `<circle cx="100" cy="100" r="86" stroke="var(--gold)" stroke-width="1.2" opacity="0.55"/>` +
    `<circle cx="100" cy="100" r="70" stroke="var(--gold-hi,#f4d97b)" stroke-width="1.6" opacity="0.9"/>` +
    bladeSeams() +
    `</g></svg>` +
    `<svg viewBox="0 0 606 594" width="42%" height="42%" fill="none" style="position:relative" aria-label="Rexran">` +
    `<defs><linearGradient id="rx-ap-grad" x1="0" y1="594" x2="606" y2="0" gradientUnits="userSpaceOnUse">` +
    `<stop stop-color="var(--gold,#d4af37)"/><stop offset="0.55" stop-color="var(--gold-hi,#f4d97b)"/><stop offset="1" stop-color="var(--gold,#d4af37)"/></linearGradient></defs>` +
    `<g transform="translate(0,594) scale(0.1,-0.1)"><path d="${R_PATH}" fill="url(#rx-ap-grad)"/></g>` +
    `</svg>`

  cover.appendChild(stage)
  document.body.appendChild(cover)

  const ring = stage.querySelector('#rx-ap-ring') as SVGGElement | null
  const maxR = Math.hypot(window.innerWidth, window.innerHeight) * 0.62

  const DURATION = 1150
  let start = 0
  let done = false
  let rafId = 0

  const setHole = (r: number) => {
    // Transparent hole (page shows) inside radius r, dark cover outside it.
    const g = `radial-gradient(circle at 50% 50%, transparent ${r}px, #000 ${r + 1}px)`
    cover.style.webkitMaskImage = g
    ;(cover.style as CSSStyleDeclaration).maskImage = g
  }

  const finish = () => {
    if (done) return
    done = true
    cancelAnimationFrame(rafId)
    window.removeEventListener('pointerdown', skip)
    window.removeEventListener('keydown', skip)
    window.removeEventListener('wheel', skip)
    window.removeEventListener('touchstart', skip)
    cover.remove()
  }

  const skip = () => {
    if (done) return
    // Fast-forward: rewind the clock so the next frame lands at the end.
    start = performance.now() - DURATION
  }

  const frame = (now: number) => {
    if (!start) start = now
    const p = clamp01((now - start) / DURATION)

    // Ring + mark: rise/scale in early, then scale up and fade as the iris opens.
    const inP = easeOut(clamp01(p / 0.2)) // 0 -> 1 over first 20%
    const outP = clamp01((p - 0.42) / 0.58) // begins at 42%
    const scale = 0.82 + 0.18 * inP + 0.55 * easeInOutCubic(outP)
    const opacity = inP * (1 - easeInOutCubic(outP))
    stage.style.transform = `scale(${scale.toFixed(3)})`
    stage.style.opacity = opacity.toFixed(3)
    if (ring) ring.setAttribute('transform', `rotate(${(p * 55).toFixed(2)} 100 100)`)

    // The iris hole opens from the centre, mostly in the back half.
    const holeP = easeInOutCubic(clamp01((p - 0.32) / 0.68))
    setHole(holeP * maxR)

    if (p >= 1) {
      finish()
      return
    }
    rafId = requestAnimationFrame(frame)
  }

  setHole(0)
  stage.style.opacity = '0'
  window.addEventListener('pointerdown', skip, { passive: true })
  window.addEventListener('keydown', skip)
  window.addEventListener('wheel', skip, { passive: true })
  window.addEventListener('touchstart', skip, { passive: true })
  rafId = requestAnimationFrame(frame)

  // Absolute safety net: never let the cover outlive the animation.
  setTimeout(finish, DURATION + 400)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', play)
} else {
  play()
}

export {}
