// Makes Rexran behave like a native app: no pinch/double-tap zoom and no
// horizontal page drag / rubber-band. Deliberately light — text stays
// selectable and the mobile showreel + media carousels keep swiping
// sideways, because the lock is applied to the PAGE, not to those scrollers.
//
// Self-contained (injects its own <style>, CSP allows inline styles) so one
// import covers every entry point across the site. Idempotent.

const STYLE_ID = 'rx-applock-style'

function apply() {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent =
      'html,body{overscroll-behavior:none;overflow-x:hidden;' +
      '-webkit-text-size-adjust:100%;text-size-adjust:100%;}' +
      // pan-x pan-y allows vertical scroll AND the horizontal carousels, but
      // disables pinch-zoom and double-tap zoom at the page level.
      'body{touch-action:pan-x pan-y;}'
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
