import { useEffect, useRef, useState } from 'react'
import './App.css'

const RMark = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
    <path d="M22 82 V18 H60 L74 32 V50 L56 58 H40" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M40 58 L74 82" fill="none" stroke="currentColor" strokeWidth="3" />
    <line x1="40" y1="58" x2="40" y2="82" stroke="currentColor" strokeWidth="3" />
  </svg>
)

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useScrolled() {
  const [s, setS] = useState(false)
  useEffect(() => {
    const on = () => setS(window.scrollY > 40)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return s
}

const PLANS = [
  { name: 'Starter', price: '$49', per: '/ project', desc: 'A sharp set of static ads to test creative before you scale spend.',
    items: ['3 static ad creatives', 'Multiple hooks & angles', 'Native Meta & TikTok sizing', '48-hour delivery'], feat: false },
  { name: 'Standard', price: '$129', per: '/ project', desc: 'The package most stores run with — one talking UGC spot plus statics.',
    items: ['1 UGC video ad (15–30s)', '2 static creatives', 'AI actor + voiceover', 'Burned-in captions', '48-hour delivery'], feat: true },
  { name: 'Premium', price: '$299', per: '/ project', desc: 'A full launch kit: cinematic film, studio shots, and ad statics.',
    items: ['Cinematic film up to 60s', '4K studio photoshoot', '3 static creatives', 'Priority delivery'], feat: false },
  { name: 'Retainer', price: '$697', per: '/ month', desc: 'Fresh creative on tap for stores that feed paid social every week.',
    items: ['4 UGC videos / month', '8 statics / month', 'Rolling revisions', 'Direct line on Instagram'], feat: false },
]

const TILES = [
  { c: 't1', n: 'FORMAT 01', t: 'UGC Video Ads', p: 'Hyper-real AI creators holding and talking through your product — natural voice, perfect lip-sync. The format that prints on paid social.', ph: 'VIDEO' },
  { c: 't2', n: 'FORMAT 02', t: 'Scroll-Stop Statics', p: 'One hook, zero clutter, sized natively for every placement.', ph: 'STATIC' },
  { c: 't3', n: 'FORMAT 03', t: 'Studio Photoshoots', p: 'Phone snaps turned into clean 4K catalog imagery.', ph: '4K' },
  { c: 't4', n: 'FORMAT 04', t: 'Cinematic Films', p: 'Brand-grade product stories without a crew.', ph: 'CINEMA' },
  { c: 't5', n: 'FORMAT 05', t: 'Full Campaign Sets', p: 'A matched pack of video and stills built to run together across every channel from day one.', ph: 'SUITE' },
]

const STEPS = [
  { n: '01', t: 'You send the product', p: 'Pick a package, drop your store link, product photos, and a few notes. That is the whole brief — no calls, no decks, no back-and-forth.' },
  { n: '02', t: 'I direct the creative', p: 'I produce every asset by hand — scripting, casting the AI actor, shooting, grading — so the output fits your brand instead of looking generated.' },
  { n: '03', t: 'You run it in 48 hours', p: 'Final files land in your Instagram DMs as clean downloads, ready to upload straight to your ad account.' },
]

export default function App() {
  useReveal()
  const scrolled = useScrolled()
  const [plan, setPlan] = useState('Standard')
  const [sent, setSent] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const choose = (name: string) => { setPlan(name); formRef.current?.scrollIntoView({ behavior: 'smooth' }) }

  const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget, r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <>
      <div className="stage" /><div className="orb a" /><div className="orb b" /><div className="grain" />

      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <a className="brand" href="#top" style={{ color: 'var(--gold)' }}><RMark />Rexran</a>
        <a className="nav-cta" href="#start">Start a project</a>
      </nav>

      {/* HERO */}
      <header className="hero" id="top">
        <div className="hero-kicker">AI-Directed Ad Studio</div>
        <h1 className="hero-h">
          <span className="ln"><span>Make them</span></span>
          <span className="ln"><span><em>stop scrolling.</em></span></span>
        </h1>
        <p className="hero-sub">
          I turn one product link into cinematic UGC video, scroll-stopping statics, and 4K product
          films — produced by hand, delivered to your DMs in 48 hours. No actors. No crew. No software to learn.
        </p>
        <div className="hero-actions">
          <a className="cta" href="#start">Start a project</a>
          <a className="cta ghost" href="#work">See the work</a>
        </div>
        <div className="scroll-hint">Scroll<div className="bar" /></div>
      </header>

      {/* MARQUEE */}
      <div className="strip">
        <div className="strip-track" aria-hidden="true">
          <span>UGC Video <b>✦</b> Static Ads <b>✦</b> Cinematic Films <b>✦</b> 4K Photoshoots <b>✦</b> Campaign Sets <b>✦</b> </span>
          <span>UGC Video <b>✦</b> Static Ads <b>✦</b> Cinematic Films <b>✦</b> 4K Photoshoots <b>✦</b> Campaign Sets <b>✦</b> </span>
        </div>
      </div>

      {/* WORK / FORMATS */}
      <section className="sec" id="work">
        <div className="wrap">
          <div className="reveal">
            <div className="sec-tag">The Work</div>
            <h2 className="sec-h">Every format your <em>ad account</em> is hungry for.</h2>
            <p className="sec-lede">Pick one, mix them, or let me recommend the set most likely to convert for your product.</p>
          </div>
          <div className="reel reveal">
            {TILES.map((t) => (
              <div className={`tile ${t.c}`} key={t.n} onMouseMove={tilt}>
                <div className="glow" />
                <span className="ph">{t.ph}</span>
                <div className="num">{t.n}</div>
                <h3>{t.t}</h3>
                <p>{t.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="sec" id="process">
        <div className="wrap">
          <div className="reveal">
            <div className="sec-tag">The Process</div>
            <h2 className="sec-h">Three steps. <em>Zero overhead</em> on your side.</h2>
          </div>
          <div className="steps reveal">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-n">{s.n}</div>
                <div><h3>{s.t}</h3><p>{s.p}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sec" id="pricing">
        <div className="wrap">
          <div className="reveal">
            <div className="sec-tag">Pricing</div>
            <h2 className="sec-h">Fixed-price packages. <em>Pick one</em> and send the product.</h2>
            <p className="sec-lede">Fully done-for-you. No contracts, no retainers locked behind calls — start with a single project.</p>
          </div>
          <div className="prices reveal">
            {PLANS.map((p) => (
              <div className={`pcard${p.feat ? ' feat' : ''}`} key={p.name}>
                {p.feat && <span className="pflag">Most picked</span>}
                <div className="pname">{p.name}</div>
                <div className="pprice">{p.price}<span className="per">{p.per}</span></div>
                <p className="pdesc">{p.desc}</p>
                <ul className="pitems">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <button className={`cta${p.feat ? '' : ' ghost'}`} onClick={() => choose(p.name)}>Choose {p.name}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTAKE */}
      <section className="sec" id="start">
        <div className="wrap" ref={formRef}>
          <div className="reveal">
            <div className="sec-tag">Start a Project</div>
            <h2 className="sec-h">Tell me about <em>the product.</em></h2>
            <p className="sec-lede">Fill this in and I'll confirm on Instagram with a timeline. Checkout connects here once payments go live.</p>
          </div>
          <div className="intake reveal">
            {sent ? (
              <div className="done"><span className="dot" /><p>Brief received. This is a preview form — once payments go live you'll check out here and I'll confirm in your DMs.</p></div>
            ) : (
              <>
                <div className="fgrid two">
                  <div className="field"><label>Brand / store name</label><input placeholder="Acme Supply Co." /></div>
                  <div className="field"><label>Store or product URL</label><input type="url" placeholder="https://" /></div>
                </div>
                <div style={{ height: 26 }} />
                <div className="fgrid two">
                  <div className="field"><label>Instagram handle</label><input placeholder="@yourstore" /></div>
                  <div className="field"><label>Email</label><input type="email" placeholder="you@store.com" /></div>
                </div>
                <div style={{ height: 26 }} />
                <div className="fgrid two">
                  <div className="field"><label>Package</label>
                    <select value={plan} onChange={(e) => setPlan(e.target.value)}>{PLANS.map((p) => <option key={p.name}>{p.name}</option>)}</select>
                  </div>
                  <div className="field"><label>Primary language</label>
                    <select><option>English</option><option>Arabic</option><option>Bilingual</option><option>Other</option></select>
                  </div>
                </div>
                <div style={{ height: 26 }} />
                <div className="fgrid">
                  <div className="field"><label>Product details & what to highlight</label><textarea placeholder="What it is, who it's for, the angle or offer to push, any text or logo that must appear…" /></div>
                </div>
                <div className="ffoot">
                  <p className="fnote">Preview only — no payment is taken yet. Stripe checkout connects here next.</p>
                  <button className="cta" onClick={() => setSent(true)}>Submit brief</button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap foot-in">
          <a className="brand" href="#top" style={{ color: 'var(--gold)', fontSize: 19 }}><RMark />Rexran</a>
          <div className="foot-links"><a href="#work">Work</a><a href="#pricing">Pricing</a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></div>
          <div className="foot-fine">© 2026 Rexran — AI-Directed Ad Studio</div>
        </div>
      </footer>
    </>
  )
}
