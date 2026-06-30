import { useEffect, useRef, useState } from 'react'
import './App.css'

const RMark = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
    <polygon className="fillR" points="22,18 60,18 74,32 74,50 56,58 74,82 56,82 40,60 40,82 22,82" />
    <path className="stroke" d="M22 82 V18 H60 L74 32 V50 L56 58 H40" />
    <path className="stroke" d="M40 58 L74 82" />
    <line className="stroke" x1="40" y1="58" x2="40" y2="82" />
  </svg>
)

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    per: 'per project',
    desc: 'A clean set of scroll-stopping static ads to test creative before you scale spend.',
    items: ['3 static ad creatives', 'Multiple angles & hooks', 'Sized for Meta & TikTok feeds', '48-hour delivery'],
    featured: false,
  },
  {
    name: 'Standard',
    price: '$129',
    per: 'per project',
    desc: 'The core package most stores run with: one talking UGC video plus supporting statics.',
    items: ['1 UGC video ad (15–30s)', '2 static ad creatives', 'AI actor + voiceover', 'Captions burned in', '48-hour delivery'],
    featured: true,
  },
  {
    name: 'Premium',
    price: '$299',
    per: 'per project',
    desc: 'A full launch kit: extended cinematic film, studio product shots, and ad statics.',
    items: ['Extended cinematic film (up to 60s)', '4K studio product photoshoot', '3 static ad creatives', 'Priority delivery'],
    featured: false,
  },
  {
    name: 'Retainer',
    price: '$697',
    per: 'per month',
    desc: 'Fresh creative on tap for stores that need to keep the feed moving every week.',
    items: ['4 UGC videos / month', '8 static creatives / month', 'Rolling revisions', 'Direct line on Instagram'],
    featured: false,
  },
]

const FORMATS = [
  { tag: 'VIDEO', title: 'UGC Video Ads', body: 'Hyper-realistic AI creators holding and talking through your product, with natural voiceover and perfect lip-sync. The format that prints on paid social.' },
  { tag: 'STATIC', title: 'Scroll-Stop Statics', body: 'High-contrast static creatives built around a single hook, sized natively for every placement so nothing gets cropped or buried.' },
  { tag: 'CINEMA', title: 'Cinematic Product Films', body: 'Sweeping, brand-grade product stories — the kind that used to need a camera crew — rendered and graded for a premium feel.' },
  { tag: '4K SHOOT', title: 'Studio Photoshoots', body: 'Raw phone snaps turned into clean 4K studio photography. Catalog-ready imagery without booking a studio or a photographer.' },
]

const PROCESS = [
  { n: '01', t: 'You send the product', p: 'Pick a package, drop your store link, product photos, and a few notes. That is the whole brief — no calls, no decks.' },
  { n: '02', t: 'I direct the creative', p: 'I produce every asset by hand — scripting, casting the AI actor, shooting, and grading — so the output actually fits your brand.' },
  { n: '03', t: 'You get it in 48 hours', p: 'Final files land straight in your Instagram DMs as clean downloads, ready to upload to your ad account and run.' },
]

export default function App() {
  useReveal()
  const [plan, setPlan] = useState('Standard')
  const [sent, setSent] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const choose = (name: string) => {
    setPlan(name)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div className="grain" />

      <nav className="nav">
        <div className="wrap nav-inner">
          <a className="wordmark" href="#top" style={{ textDecoration: 'none' }}>
            <RMark />
            Rexran
          </a>
          <ul className="nav-links">
            <li><a href="#work">Work</a></li>
            <li><a href="#process">Process</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
          <a className="btn" href="#start">Start a project</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero" id="top">
        <RMark className="hero-watermark" />
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow-tab"><span className="num">01 /</span> AI-directed ad studio</div>
            <h1 className="hero-title">Ads your store <em>deserves</em>, without the production.</h1>
            <p className="hero-sub">
              I turn a single product link into UGC video ads, scroll-stopping statics, and cinematic
              films — produced by hand and delivered to your DMs in 48 hours. No actors, no film crew,
              no software for you to learn.
            </p>
            <div className="hero-actions">
              <a className="btn" href="#start">Start a project</a>
              <a className="btn btn-ghost" href="#work">See what I make</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="v">48h</div><div className="l">Typical turnaround</div></div>
              <div className="hero-stat"><div className="v">4K</div><div className="l">Native output</div></div>
              <div className="hero-stat"><div className="v">70+</div><div className="l">Languages &amp; accents</div></div>
            </div>
          </div>
          <div className="hero-mark-wrap">
            <RMark className="hero-mark" />
          </div>
        </div>
      </header>

      {/* ABOUT / WORK */}
      <section className="section" id="work">
        <div className="wrap about-grid">
          <div className="reveal">
            <div className="eyebrow-tab"><span className="num">02 /</span> What this is</div>
            <p className="about-lead">
              A one-person creative studio that produces <span className="accent">paid-social ad creative</span> for
              ecommerce and DTC brands — fast, hands-on, and priced for stores that are still scaling.
            </p>
          </div>
          <ul className="about-list reveal">
            <li><span className="k">Who for</span><span className="v"><strong>Shopify &amp; DTC store owners</strong> who need ad creative but don't have a studio, a videographer, or time to learn another tool.</span></li>
            <li><span className="k">What you get</span><span className="v"><strong>Finished, ready-to-run assets</strong> — UGC video, statics, cinematic film, product shots — not software access or a pile of raw clips.</span></li>
            <li><span className="k">How it works</span><span className="v"><strong>Fully done-for-you.</strong> You send the product, I direct and produce everything, you receive downloads in your DMs.</span></li>
          </ul>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section" id="process">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow-tab"><span className="num">03 /</span> The process</div>
            <h2 className="section-title">Three steps, zero overhead on your side.</h2>
          </div>
          <div className="process-rail reveal">
            {PROCESS.map((s) => (
              <div className="process-step" key={s.n}>
                <div className="process-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMATS */}
      <section className="section">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow-tab"><span className="num">04 /</span> Formats</div>
            <h2 className="section-title">Every creative format your ad account needs.</h2>
            <p className="section-lede">Pick one, mix them, or let me recommend the set most likely to convert for your product.</p>
          </div>
          <div className="format-grid reveal">
            {FORMATS.map((f) => (
              <div className="format-card" key={f.title}>
                <span className="format-tag">{f.tag}</span>
                <svg className="format-icon" viewBox="0 0 32 32"><rect className="s" x="5" y="7" width="22" height="18" /><path className="s" d="M13 13 L20 16 L13 19 Z" /></svg>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow-tab"><span className="num">05 /</span> Pricing</div>
            <h2 className="section-title">Simple packages. Pick one and send the product.</h2>
            <p className="section-lede">Every package is fixed-price and fully done-for-you. No retainers locked behind contracts — start with a single project.</p>
          </div>
          <div className="price-grid reveal">
            {PLANS.map((p) => (
              <div className={`price-card${p.featured ? ' is-featured' : ''}`} key={p.name}>
                {p.featured && <span className="price-flag">Most picked</span>}
                <div className="price-name">{p.name}</div>
                <div className="price-amount">{p.price}<span className="per">{p.per}</span></div>
                <p className="price-desc">{p.desc}</p>
                <ul className="price-items">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <button className={`btn${p.featured ? '' : ' btn-ghost'}`} onClick={() => choose(p.name)}>Choose {p.name}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTAKE */}
      <section className="section" id="start">
        <div className="wrap" ref={formRef}>
          <div className="section-head reveal">
            <div className="eyebrow-tab"><span className="num">06 /</span> Start a project</div>
            <h2 className="section-title">Tell me about the product.</h2>
            <p className="section-lede">Fill this in and I'll confirm on Instagram with a timeline. Payment is handled securely once we lock the brief.</p>
          </div>

          <div className="intake-shell reveal">
            {sent ? (
              <div className="confirm-box">
                <span className="dot" />
                <p>Brief received. This is a preview form — once payments go live, you'll check out here and I'll confirm in your DMs.</p>
              </div>
            ) : (
              <>
                <div className="form-grid two">
                  <div className="field"><label>Brand / store name</label><input type="text" placeholder="Acme Supply Co." /></div>
                  <div className="field"><label>Store or product URL</label><input type="url" placeholder="https://" /></div>
                </div>
                <div style={{ height: 24 }} />
                <div className="form-grid two">
                  <div className="field"><label>Instagram handle</label><input type="text" placeholder="@yourstore" /></div>
                  <div className="field"><label>Email</label><input type="email" placeholder="you@store.com" /></div>
                </div>
                <div style={{ height: 24 }} />
                <div className="form-grid two">
                  <div className="field">
                    <label>Package</label>
                    <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                      {PLANS.map((p) => <option key={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Primary language</label>
                    <select><option>English</option><option>Arabic</option><option>Bilingual</option><option>Other</option></select>
                  </div>
                </div>
                <div style={{ height: 24 }} />
                <div className="form-grid">
                  <div className="field"><label>Product details &amp; what to highlight</label><textarea placeholder="What it is, who it's for, the angle or offer you want pushed, any text or logo that must appear…" /></div>
                </div>
                <div className="form-foot">
                  <p className="form-note">Preview only — no payment is taken yet. Stripe checkout connects here next.</p>
                  <button className="btn" onClick={() => setSent(true)}>Submit brief</button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap footer-inner">
          <a className="wordmark" href="#top" style={{ textDecoration: 'none', fontSize: 18 }}><RMark />Rexran</a>
          <ul className="footer-links">
            <li><a href="#work">Work</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
          </ul>
          <div className="footer-fine">© 2026 Rexran — AI-directed ad studio</div>
        </div>
      </footer>
    </>
  )
}
