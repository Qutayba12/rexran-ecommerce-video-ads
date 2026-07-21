# Rexran — AI-Directed Ad Studio

Marketing site + order/checkout flow + client delivery portal for Rexran, an
AI-directed ad production studio for DTC/Shopify brands (UGC video, static
creative, cinematic product films).

## Stack

- **Frontend**: React 19 + TypeScript, built with Vite. Three React entry
  points share one Vite build: the marketing site (`src/main.tsx` →
  `index.html`), the admin panel (`src/admin.tsx` → `admin.html`), and the
  client delivery page (`src/delivery.tsx` → `delivery.html`). Content pages
  (`privacy.html`, `terms.html`, `studio.html`, `guides.html`, and the
  individual `guide-*.html` articles) are plain static HTML with a shared
  `public/content.css` — no JS, fast, and easy to index. Every extra
  `.html` file needs an entry in `vite.config.ts`'s `build.rollupOptions.input`
  and, for a pretty URL, a rewrite in `vercel.json`.
- **Backend**: Vercel Serverless Functions under `api/`. No framework — each
  file is a standalone handler.
- **Data**: Upstash Redis (portfolio videos, client deliveries, paid orders).
- **File storage**: Vercel Blob (client-side direct upload, bypasses the
  serverless body-size limit).
- **Payments**: Stripe Checkout (hosted page — no card data touches this
  server). Payment confirmation arrives via a Stripe webhook.
- **Notifications**: Telegram bot + Resend (email), both best-effort.

## Local development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build — must pass before shipping
npm run lint
```

The `api/*.js` functions only run under `vercel dev` or once deployed to
Vercel — the Vite dev server serves the frontend only.

## Environment variables

Set these in the Vercel project settings (Production + Preview):

| Variable | Used by | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `api/admin-videos.js`, `api/deliveries.js`, `api/orders.js`, `api/upload.js` | Shared password gating the admin panel and all admin API calls. |
| `STRIPE_SECRET_KEY` | `api/checkout.js` | Creates the Stripe Checkout session. |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe-webhook.js` | Verifies that webhook calls genuinely came from Stripe. |
| `BLOB_READ_WRITE_TOKEN` | `api/upload.js` | Vercel Blob write access (auto-provided once the Blob store is connected to the project). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | all `api/` files using `Redis.fromEnv()` | Auto-provided once an Upstash Redis store is connected to the project. |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | `api/order.js`, `api/stripe-webhook.js` | Sends order/contact/payment alerts to a Telegram chat. |
| `RESEND_API_KEY` | `api/order.js`, `api/stripe-webhook.js` | Sends the same alerts by email. Optional — emails are skipped if unset. |
| `ORDER_EMAIL` | same as above | Inbox that receives order/contact/payment emails. Defaults to `hello@rexran.com`. |
| `ORDER_FROM` | same as above | Verified "from" address for outgoing email. Defaults to a `resend.dev` sandbox address. |
| `VITE_GA_MEASUREMENT_ID` | `src/analytics.ts` (client-side, must be set at **build** time, not just runtime) | Google Analytics 4 measurement ID (`G-XXXXXXX`). Optional — analytics stays fully off, no script loads, until this is set. |
| `VITE_META_PIXEL_ID` | `src/analytics.ts` (client-side, build time) | Meta (Facebook) Pixel ID. Optional — same as above. |

**Before setting either `VITE_*` variable in production**, update `privacy.html` — it currently states outright that Rexran does not use advertising or tracking cookies, which stops being true the moment a real analytics ID goes live.

## How an order flows

1. Customer picks a plan or builds a custom package on the marketing site,
   fills in their details, and hits pay.
2. `POST /api/checkout` **recomputes the price server-side** from
   `api/_lib/pricing.js` (never trusts the amount the browser sends) and
   creates a Stripe Checkout Session.
3. Customer pays on Stripe's hosted page.
4. Stripe calls `POST /api/stripe-webhook`, which verifies the signature,
   records the order in Redis (`rexran:orders` — this also makes the
   handler idempotent against Stripe's at-least-once delivery), and sends a
   Telegram + email alert.
5. The studio uploads finished files in the admin panel, which creates a
   `delivery` record with an unguessable id; the customer opens
   `/delivery/:id` to download their files.
6. From that same page, the customer can optionally leave a star rating and
   a note. It's stored as "pending" and never shown anywhere until a studio
   admin approves it in the admin panel — approved testimonials then appear
   in the "What Clients Say" section on the homepage.

## API surface

| Route | Auth | Purpose |
| --- | --- | --- |
| `GET /api/videos` | public | Portfolio videos shown on the site. |
| `GET /api/delivery?id=` | public (unguessable id) | One client delivery's files. |
| `GET /api/testimonials` | public | Approved client testimonials shown on the site. |
| `POST /api/testimonials` | rate-limited | A client submits feedback tied to their delivery id — stored as pending, never shown until approved. |
| `POST /api/order` | rate-limited | Contact-form message → Telegram/email. |
| `POST /api/checkout` | rate-limited | Create a Stripe Checkout session. |
| `POST /api/stripe-webhook` | Stripe signature | Payment confirmation → record + notify. |
| `POST /api/admin-videos` | admin password | Add/remove portfolio videos. |
| `POST /api/deliveries` | admin password | Create/list/remove client deliveries. |
| `POST /api/admin-testimonials` | admin password | List/approve/reject/delete client testimonials. |
| `POST /api/orders` | admin password | List recorded paid orders. |
| `POST /api/upload` | admin password (via client payload) | Issue a Vercel Blob client-upload token. |

Admin endpoints share a Redis-backed brute-force guard (`api/_lib/rateLimit.js`):
10 wrong passwords from the same IP within 15 minutes returns `429` regardless
of which admin endpoint is hit.
