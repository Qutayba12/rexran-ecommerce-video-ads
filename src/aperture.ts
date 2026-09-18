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

// The Rexran "Regalia Crest": two mirrored R's (outlined from Bodoni Moda) that
// share a spine, plus a four-point spark. Same paths the RexMark component uses.
const R_PATH =
  'M413 758V781H706Q802 781 868.0 818.0Q934 855 967.5 930.5Q1001 1006 1001 1121Q1001 1236 967.5 1311.5Q934 1387 868.0 1424.0Q802 1461 706 1461H52V1500H736Q896 1500 1017.0 1459.5Q1138 1419 1205.5 1335.0Q1273 1251 1273 1121Q1273 991 1209.5 911.0Q1146 831 1026.0 794.5Q906 758 736 758ZM52 0V39H731V0ZM260 21V1476H522V21ZM1226 -13Q1130 -13 1076.0 19.0Q1022 51 996.5 105.0Q971 159 964.0 226.0Q957 293 956.0 364.5Q955 436 949.0 503.0Q943 570 920.5 624.0Q898 678 846.0 710.0Q794 742 702 742H413V763H814Q955 763 1037.0 723.5Q1119 684 1160.5 619.0Q1202 554 1215.5 477.0Q1229 400 1230.0 323.0Q1231 246 1234.0 181.0Q1237 116 1256.0 76.5Q1275 37 1326 37Q1358 37 1383.0 44.0Q1408 51 1429 61L1442 23Q1418 10 1360.5 -1.5Q1303 -13 1226 -13Z'

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
    `<svg viewBox="0 0 2442 1693" width="60%" height="60%" style="position:relative" fill="none" aria-label="Rexran">` +
    `<defs><linearGradient id="rx-ap-grad" x1="0" y1="1693" x2="2442" y2="0" gradientUnits="userSpaceOnUse">` +
    `<stop stop-color="var(--gold,#d4af37)"/><stop offset="0.34" stop-color="var(--gold-hi,#f4d97b)"/><stop offset="0.62" stop-color="#F8EBBE"/><stop offset="1" stop-color="var(--gold,#d4af37)"/></linearGradient></defs>` +
    `<g fill="url(#rx-ap-grad)" transform="translate(38 1590) scale(1 -1)"><path d="${R_PATH}"/><path d="${R_PATH}" transform="translate(2366 0) scale(-1 1)"/><path d="M 1183 880 Q 1205 782 1183 690 Q 1161 782 1183 880 Z"/></g>` +
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
