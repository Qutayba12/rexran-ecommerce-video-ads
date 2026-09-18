// Makes Rexran feel like a native app ON TOUCH DEVICES: no pinch / double-tap
// zoom and no horizontal rubber-band. It is deliberately scoped to touch
// (coarse-pointer) devices ONLY. On a laptop or desktop — where the pointer is
// "fine" (trackpad or mouse) — this module does nothing at all, so it can never
// interfere with two-finger trackpad scrolling or wheel scrolling there. The
// page-level touch lock previously ran on every device, which broke trackpad
// scrolling on laptops; gating it to coarse pointers keeps the mobile app-feel
// without ever touching the desktop experience.
//
// Self-contained (injects its own <style>, CSP allows inline styles) so one
// import covers every entry point across the site. Idempotent.

const STYLE_ID = 'rx-applock-style'

function apply() {
  // Only touch (coarse-pointer) devices get locked. A laptop trackpad and a
  // mouse are FINE pointers and must be left completely alone.
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  if (!coarse) return

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent =
      // Block only horizontal overscroll/rubber-band; keep vertical scrolling
      // untouched so the page always scrolls.
      'html,body{overscroll-behavior-x:none;-webkit-text-size-adjust:100%;text-size-adjust:100%;}' +
      // pan-y keeps vertical page scrolling while disabling pinch-zoom and
      // double-tap zoom. The horizontal carousels are inner elements with their
      // own (default) touch-action, so they keep swiping sideways.
      'body{touch-action:pan-y;}'
    document.head.appendChild(style)
  }

  // Older iOS Safari can still pinch despite touch-action — block its gesture
  // events. These fire only on multi-finger zoom, so normal scrolling/taps are
  // untouched.
  const block = (e: Event) => e.preventDefault()
  ;(['gesturestart', 'gesturechange', 'gestureend'] as const).forEach((evt) =>
    document.addEventListener(evt, block, { passive: false }),
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', apply)
} else {
  apply()
}

export {}
