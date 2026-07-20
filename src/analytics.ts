// Analytics — OFF by default. Nothing here runs, and no third-party script
// ever loads, unless VITE_GA_MEASUREMENT_ID and/or VITE_META_PIXEL_ID are set
// in the environment. This keeps privacy.html's "no tracking" claim true
// until real IDs are added — update that page when you turn this on.
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] }
  }
}

function loadGoogleAnalytics(measurementId: string) {
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag(...args: unknown[]) { window.dataLayer!.push(args) }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', measurementId)
}

// Standard Meta Pixel base code, adapted to avoid eval/inline-script patterns.
function loadMetaPixel(pixelId: string) {
  type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[] }
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue.push(args)
  }) as Fbq
  fbq.queue = []
  window.fbq = fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}

export function initAnalytics() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID
  const pixelId = import.meta.env.VITE_META_PIXEL_ID
  if (gaId) loadGoogleAnalytics(gaId)
  if (pixelId) loadMetaPixel(pixelId)
}

// Fires once, right after a customer returns from a successful Stripe
// Checkout — safe to call even when no provider is configured (each tracker
// is a no-op until initAnalytics() has loaded it).
export function trackPurchase(sessionId: string | null) {
  window.gtag?.('event', 'purchase', sessionId ? { transaction_id: sessionId } : {})
  window.fbq?.('track', 'Purchase', sessionId ? { transaction_id: sessionId } : {})
}
