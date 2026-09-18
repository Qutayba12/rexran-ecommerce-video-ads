// Rexran signature: the aperture-eye cursor. On desktop (fine pointer), the
// native cursor is replaced by the brand's own gold "eye" glyph that trails the
// pointer and dilates over anything clickable — a bespoke touch nobody else has.
// Self-contained (injects its own style + element, uses the --aurum-foil and
// --eye-mask tokens). Skips touch devices and reduced-motion entirely, and
// never blocks input (pointer-events: none).

const STYLE_ID = 'rx-cursor-style'
const HOT = 'a, button, [role="button"], input, textarea, select, label, summary, .cta, .nav-cta, [onclick], [data-hot]'

function start() {
  const fine = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduced) return
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent =
    'html.rx-cursor-on, html.rx-cursor-on * { cursor: none !important; }' +
    '#rx-cursor { position: fixed; left: 0; top: 0; z-index: 99999; pointer-events: none; will-change: transform; transform: translate3d(-100px,-100px,0); }' +
    '#rx-cursor i { display: block; width: 26px; height: 26px; margin: -13px 0 0 -13px; background: var(--aurum-foil, #D4AF37);' +
    ' -webkit-mask: var(--eye-mask) center/contain no-repeat; mask: var(--eye-mask) center/contain no-repeat;' +
    ' filter: drop-shadow(0 0 6px rgba(212,175,55,.55)); transition: transform .18s cubic-bezier(.16,1,.3,1), opacity .25s; }' +
    '#rx-cursor.hot i { transform: scale(1.55) rotate(90deg); }' +
    '#rx-cursor.down i { transform: scale(.7); }' +
    '#rx-cursor.hide i { opacity: 0; }'
  document.head.appendChild(style)

  const cur = document.createElement('div')
  cur.id = 'rx-cursor'
  cur.innerHTML = '<i></i>'
  cur.setAttribute('aria-hidden', 'true')
  document.body.appendChild(cur)
  document.documentElement.classList.add('rx-cursor-on')

  let tx = -100, ty = -100, x = -100, y = -100, raf = 0, seen = false
  const move = (e: PointerEvent) => {
    tx = e.clientX; ty = e.clientY
    if (!seen) { seen = true; x = tx; y = ty; cur.classList.remove('hide') }
    const hot = !!(e.target as Element)?.closest?.(HOT)
    cur.classList.toggle('hot', hot)
  }
  const loop = () => {
    x += (tx - x) * 0.28
    y += (ty - y) * 0.28
    cur.style.transform = `translate3d(${x}px,${y}px,0)`
    raf = requestAnimationFrame(loop)
  }
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', () => cur.classList.add('down'))
  window.addEventListener('pointerup', () => cur.classList.remove('down'))
  window.addEventListener('pointerleave', () => cur.classList.add('hide'))
  document.addEventListener('mouseleave', () => cur.classList.add('hide'))
  raf = requestAnimationFrame(loop)
  void raf
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}

export {}
