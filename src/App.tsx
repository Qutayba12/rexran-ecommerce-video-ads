import { useEffect, useRef, useState } from 'react'
import './App.css'
import RexMark from './RexMark'

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
  { name: 'Spark', price: '$39', per: '/ project', desc: 'A quick test spot to see how AI creative performs for your product.',
    items: ['1 UGC video (up to 15s)', '1 static ad creative', 'One aspect ratio', '48-hour delivery'], feat: false },
  { name: 'Growth', price: '$99', per: '/ project', desc: 'The package most stores run with — a full talking spot plus statics.',
    items: ['1 UGC video (up to 30s)', '3 static ad creatives', 'AI actor + voiceover', 'Up to 2 aspect ratios', '48-hour delivery'], feat: true },
  { name: 'Scale', price: '$199', per: '/ project', desc: 'A launch-ready kit when you want to go live on every channel at once.',
    items: ['2 UGC videos', '1 short cinematic film', '5 static creatives', 'All aspect ratios', 'Priority delivery'], feat: false },
  { name: 'Brand Partner', price: '$549', per: '/ month', desc: 'Fresh creative on tap for stores that feed paid social every week.',
    items: ['4 UGC videos / month', '1 cinematic film / month', '10 statics / month', 'Rolling revisions', 'Direct line on Instagram'], feat: false },
]

const TILES = [
  { c: 't1', n: 'FORMAT 01', t: 'UGC Video Ads', p: 'Hyper-real AI creators holding and talking through your product — natural voice, perfect lip-sync. The format that prints on paid social.', ph: 'VIDEO' },
  { c: 't2', n: 'FORMAT 02', t: 'Scroll-Stop Statics', p: 'One hook, zero clutter, sized natively for every placement.', ph: 'STATIC' },
  { c: 't3', n: 'FORMAT 03', t: 'Studio Photoshoots', p: 'Phone snaps turned into clean 4K catalog imagery.', ph: '4K' },
  { c: 't4', n: 'FORMAT 04', t: 'Cinematic Films', p: 'Brand-grade product stories without a crew.', ph: 'CINEMA' },
  { c: 't5', n: 'FORMAT 05', t: 'Full Campaign Sets', p: 'A matched pack of video and stills built to run together across every channel from day one.', ph: 'SUITE' },
]

const STEPS = [
  { n: '01', t: 'You send the product', p: 'Pick a package, drop your product link and photos, tell me the size and where it will run. That is the whole brief.' },
  { n: '02', t: 'I direct the creative', p: 'I produce every asset by hand — scripting, casting the AI actor, shooting, grading — so it fits your brand, not a template.' },
  { n: '03', t: 'You run it in 48 hours', p: 'Final files land in your Instagram DMs as clean downloads, ready to upload straight to your ad account.' },
]

// Real Soda-supported ratios
const VIDEO_RATIOS = ['9:16 Portrait', '16:9 Landscape', '1:1 Square', '21:9 Ultrawide', '4:3', '3:4']
const IMAGE_RATIOS = ['1:1', '16:9', '9:16', '3:2', '2:3']

// Custom builder unit prices
const UNITS = [
  { key: 'ugc15', label: 'UGC video — up to 15s', price: 29 },
  { key: 'ugc30', label: 'UGC video — up to 30s', price: 49 },
  { key: 'cine', label: 'Short cinematic film', price: 79 },
  { key: 'static', label: 'Static ad creative', price: 12 },
  { key: 'ratio', label: 'Extra aspect ratio (per asset)', price: 6 },
]
const MIN_ORDER = 25

export default function App() {
  useReveal()
  const scrolled = useScrolled()
  const [plan, setPlan] = useState('Growth')
  const [assetType, setAssetType] = useState<'Video' | 'Image' | 'Both'>('Both')
  const [videoRatio, setVideoRatio] = useState<string[]>(['9:16 Portrait'])
  const [imageRatio, setImageRatio] = useState<string[]>(['1:1'])
  const [sent, setSent] = useState(false)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [qty, setQty] = useState<Record<string, number>>({ ugc15: 0, ugc30: 1, cine: 0, static: 2, ratio: 0 })
  const formRef = useRef<HTMLDivElement>(null)

  const choose = (name: string) => { setPlan(name); formRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  const bump = (key: string, d: number) => setQty((q) => ({ ...q, [key]: Math.max(0, (q[key] || 0) + d) }))
  const total = UNITS.reduce((s, u) => s + (qty[u.key] || 0) * u.price, 0)

  return (
    <>
      <div className="stage">
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="mesh" />
      </div>
      <div className="grain" />

      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <a className="brand" href="#top"><RexMark className="brand-logo" />Rexran</a>
        <a className="nav-cta" href="#start">Start a project</a>
      </nav>

      <header className="hero" id="top">
        <RexMark className="hero-logo" />
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

      <div className="strip">
        <div className="strip-track" aria-hidden="true">
          <span>UGC Video <b>✦</b> Static Ads <b>✦</b> Cinematic Films <b>✦</b> 4K Photoshoots <b>✦</b> Campaign Sets <b>✦</b> </span>
          <span>UGC Video <b>✦</b> Static Ads <b>✦</b> Cinematic Films <b>✦</b> 4K Photoshoots <b>✦</b> Campaign Sets <b>✦</b> </span>
        </div>
      </div>

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
                <div className="glow" /><span className="ph">{t.ph}</span>
                <div className="num">{t.n}</div><h3>{t.t}</h3><p>{t.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="process">
        <div className="wrap">
          <div className="reveal">
            <div className="sec-tag">The Process</div>
            <h2 className="sec-h">Three steps. <em>Zero overhead</em> on your side.</h2>
          </div>
          <div className="steps reveal">
            {STEPS.map((s) => (
              <div className="step" key={s.n}><div className="step-n">{s.n}</div><h3>{s.t}</h3><p>{s.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="pricing">
        <div className="wrap">
          <div className="reveal">
            <div className="sec-tag">Pricing</div>
            <h2 className="sec-h">Built around <em>video.</em> Pick one and send the product.</h2>
            <p className="sec-lede">Every package leads with video — the format that converts — with statics to round out the set. Fully done-for-you, no contracts.</p>
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
          <div className="builder-row reveal">
            <button className="builder-trigger" onClick={() => setBuilderOpen(true)}>
              <span className="plus">+</span> Build your own package
            </button>
          </div>
        </div>
      </section>

      <section className="sec" id="start">
        <div className="wrap" ref={formRef}>
          <div className="reveal">
            <div className="sec-tag">Start a Project</div>
            <h2 className="sec-h">Tell me about <em>the product.</em></h2>
            <p className="sec-lede">The more you give me here, the sharper the result. I'll confirm on Instagram with a timeline.</p>
          </div>
          <div className="intake reveal">
            {sent ? (
              <div className="done"><span className="dot" /><p>Brief received. This is a preview form — once payments go live you'll check out here and I'll confirm in your DMs.</p></div>
            ) : (
              <>
                <div className="fgrid two">
                  <div className="field"><label>Brand / store name</label><input placeholder="Acme Supply Co." /></div>
                  <div className="field"><label>Product link</label><input type="url" placeholder="https://…/your-product" /></div>
                </div>
                <div style={{ height: 26 }} />
                <div className="fgrid two">
                  <div className="field"><label>Instagram handle</label><input placeholder="@yourstore" /></div>
                  <div className="field"><label>Email</label><input type="email" placeholder="you@store.com" /></div>
                </div>
                <div style={{ height: 26 }} />
                <div className="fgrid two">
                  <div className="field"><label>Package</label>
                    <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                      {PLANS.map((p) => <option key={p.name}>{p.name}</option>)}
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="field"><label>Primary language</label>
                    <select><option>English</option><option>Arabic</option><option>Bilingual</option><option>Other</option></select>
                  </div>
                </div>
                <div style={{ height: 26 }} />
                <div className="field">
                  <label>What do you need?</label>
                  <div className="chips">
                    {(['Video', 'Image', 'Both'] as const).map((t) => (
                      <button type="button" key={t} className={`chip${assetType === t ? ' on' : ''}`}
                        onClick={() => setAssetType(t)}>{t}</button>
                    ))}
                  </div>
                </div>
                {(assetType === 'Video' || assetType === 'Both') && (
                  <>
                    <div style={{ height: 26 }} />
                    <div className="field">
                      <label>Video aspect ratio</label>
                      <div className="chips">
                        {VIDEO_RATIOS.map((r) => (
                          <button type="button" key={r} className={`chip${videoRatio.includes(r) ? ' on' : ''}`} onClick={() => toggle(videoRatio, setVideoRatio, r)}>{r}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {(assetType === 'Image' || assetType === 'Both') && (
                  <>
                    <div style={{ height: 26 }} />
                    <div className="field">
                      <label>Image aspect ratio</label>
                      <div className="chips">
                        {IMAGE_RATIOS.map((r) => (
                          <button type="button" key={r} className={`chip${imageRatio.includes(r) ? ' on' : ''}`} onClick={() => toggle(imageRatio, setImageRatio, r)}>{r}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div style={{ height: 26 }} />
                <div className="field"><label>Product details & what to highlight</label><textarea placeholder="What it is, who it's for, the angle or offer to push, any text or logo that must appear…" /></div>
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
          <a className="brand" href="#top" style={{ fontSize: 20 }}><RexMark className="brand-logo" />Rexran</a>
          <div className="foot-links"><a href="#work">Work</a><a href="#pricing">Pricing</a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></div>
          <div className="foot-fine">© 2026 Rexran — AI-Directed Ad Studio</div>
        </div>
      </footer>

      {/* CUSTOM BUILDER MODAL */}
      {builderOpen && (
        <div className="modal-back" onClick={() => setBuilderOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setBuilderOpen(false)} aria-label="Close">✕</button>
            <h3>Build <em>your own.</em></h3>
            <p className="modal-lede">Choose exactly what you need — the price updates as you go.</p>
            {UNITS.map((u) => (
              <div className="bitem" key={u.key}>
                <div className="bitem-info"><h4>{u.label}</h4><p>${u.price} each</p></div>
                <div className="stepper">
                  <button onClick={() => bump(u.key, -1)} disabled={(qty[u.key] || 0) === 0} aria-label="Decrease">−</button>
                  <span className="qty">{qty[u.key] || 0}</span>
                  <button onClick={() => bump(u.key, 1)} aria-label="Increase">+</button>
                </div>
              </div>
            ))}
            <div className="btotal">
              <div className="sum"><span className="lab">Your total</span>${total}</div>
              <button className="cta" onClick={() => { setBuilderOpen(false); setPlan('Custom'); formRef.current?.scrollIntoView({ behavior: 'smooth' }) }}>
                Continue with this
              </button>
            </div>
            {total > 0 && total < MIN_ORDER && <p className="bmin">Minimum order is ${MIN_ORDER}. Add a little more to continue.</p>}
          </div>
        </div>
      )}
    </>
  )
}
