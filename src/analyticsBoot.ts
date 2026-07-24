// Boots site-wide analytics on the static (non-React) pages — studio, guides,
// privacy, terms — so visits to those pages are counted too. The React entries
// (homepage, thank-you) already call initAnalytics() themselves. This is a
// no-op until VITE_GA_MEASUREMENT_ID is set, and ships as a bundled module
// because the CSP forbids inline scripts (script-src 'self' + gtag only).
import { initAnalytics } from './analytics'

initAnalytics()
