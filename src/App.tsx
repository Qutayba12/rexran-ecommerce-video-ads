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
  { n: '01', t: 'You send the product', p: 'Pick a package, drop your product link and photos, choose your services and sizes. That is the whole brief.' },
  { n: '02', t: 'I direct the creative', p: 'I produce every asset by hand — scripting, casting the AI actor, shooting, grading — so it fits your brand, not a template.' },
  { n: '03', t: 'You run it in 48 hours', p: 'Final files land in your Instagram DMs as clean downloads, ready to upload straight to your ad account.' },
]

const VIDEO_RATIOS = ['9:16', '16:9', '1:1', '21:9', '4:3', '3:4']
const IMAGE_RATIOS = ['1:1', '16:9', '9:16', '3:2', '2:3']

// What each ready-made package contains (for size selection)
const PLAN_CONTENTS: Record<string, { key: string; label: string; ratios: string[] }[]> = {
  Spark: [
    { key: 'ugc', label: 'UGC video', ratios: VIDEO_RATIOS },
    { key: 'static', label: 'Static ad image', ratios: IMAGE_RATIOS },
  ],
  Growth: [
    { key: 'ugc', label: 'UGC video', ratios: VIDEO_RATIOS },
    { key: 'static', label: 'Static ad images', ratios: IMAGE_RATIOS },
  ],
  Scale: [
    { key: 'ugc', label: 'UGC videos', ratios: VIDEO_RATIOS },
    { key: 'cine', label: 'Cinematic film', ratios: VIDEO_RATIOS },
    { key: 'static', label: 'Static ad images', ratios: IMAGE_RATIOS },
  ],
  'Brand Partner': [
    { key: 'ugc', label: 'UGC videos', ratios: VIDEO_RATIOS },
    { key: 'cine', label: 'Cinematic film', ratios: VIDEO_RATIOS },
    { key: 'static', label: 'Static ad images', ratios: IMAGE_RATIOS },
  ],
}

// Every service has its own ratio set + unit price
type Service = { key: string; label: string; price: number; ratios: string[] }
const SERVICES: Service[] = [
  { key: 'ugc', label: 'UGC Video Ad', price: 49, ratios: VIDEO_RATIOS },
  { key: 'cine', label: 'Cinematic Film', price: 79, ratios: VIDEO_RATIOS },
  { key: 'static', label: 'Static Ad Image', price: 12, ratios: IMAGE_RATIOS },
  { key: 'shoot', label: 'Product Photoshoot', price: 18, ratios: IMAGE_RATIOS },
]
const MIN_ORDER = 25

type Line = { qty: number; ratios: string[] }
const emptyLines = (): Record<string, Line> =>
  Object.fromEntries(SERVICES.map((s) => [s.key, { qty: 0, ratios: [] }]))

export default function App() {
  useReveal()
  const scrolled = useScrolled()
  const [plan, setPlan] = useState('Growth')
  const [sent, setSent] = useState(false)
  const [builderOpen, setBuilderOpen] = useState(false)

  // form services (toggle + per-service ratios)
  const [picked, setPicked] = useState<Record<string, Line>>(() => ({
    ...emptyLines(), ugc: { qty: 1, ratios: ['9:16'] },
  }))
  // builder services (qty + per-service ratios + live price)
  const [build, setBuild] = useState<Record<string, Line>>(() => ({
    ...emptyLines(), ugc: { qty: 1, ratios: ['9:16'] }, static: { qty: 2, ratios: ['1:1'] },
  }))

  // ratios chosen for a ready-made package (one set of choices per content type)
  const [planRatios, setPlanRatios] = useState<Record<string, string[]>>({ ugc: ['9:16'], cine: ['16:9'], static: ['1:1'] })
  const togglePlanRatio = (typeKey: string, r: string) =>
    setPlanRatios((p) => {
      const cur = p[typeKey] || []
      return { ...p, [typeKey]: cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r] }
    })

  const formRef = useRef<HTMLDivElement>(null)
  const choose = (name: string) => { setPlan(name); formRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const toggleService = (state: Record<string, Line>, set: (v: Record<string, Line>) => void, key: string) => {
    const cur = state[key]
    set({ ...state, [key]: cur.qty > 0 ? { qty: 0, ratios: [] } : { qty: 1, ratios: [] } })
  }
  const setQty = (state: Record<string, Line>, set: (v: Record<string, Line>) => void, key: string, d: number) => {
    const q = Math.max(0, state[key].qty + d)
    set({ ...state, [key]: { qty: q, ratios: q === 0 ? [] : state[key].ratios } })
  }
  const toggleRatio = (state: Record<string, Line>, set: (v: Record<string, Line>) => void, key: string, r: string) => {
    const line = state[key]
    const ratios = line.ratios.includes(r) ? line.ratios.filter((x) => x !== r) : [...line.ratios, r]
    set({ ...state, [key]: { ...line, ratios } })
  }

  const buildTotal = SERVICES.reduce((s, sv) => s + build[sv.key].qty * sv.price, 0)

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
                <div style={{ height: 30 }} />
                {plan === 'Custom' ? (
                  <div className="field">
                    <label>Choose your services & sizes</label>
                    <div className="svc-list">
                      {SERVICES.map((sv) => {
                        const line = picked[sv.key]
                        const on = line.qty > 0
                        return (
                          <div className={`svc${on ? ' on' : ''}`} key={sv.key}>
                            <div className="svc-head" onClick={() => toggleService(picked, setPicked, sv.key)}>
                              <span className={`svc-check${on ? ' on' : ''}`}>{on ? '✓' : ''}</span>
                              <span className="svc-name">{sv.label}</span>
                              <span className="svc-price">${sv.price} each</span>
                            </div>
                            {on && (
                              <div className="svc-body">
                                <div className="svc-qty">
                                  <span className="svc-qty-lab">Quantity</span>
                                  <div className="stepper sm">
                                    <button onClick={() => setQty(picked, setPicked, sv.key, -1)} disabled={line.qty <= 1} aria-label="Decrease">−</button>
                                    <span className="qty">{line.qty}</span>
                                    <button onClick={() => setQty(picked, setPicked, sv.key, 1)} aria-label="Increase">+</button>
                                  </div>
                                </div>
                                <div className="svc-ratios">
                                  <span className="svc-qty-lab">Sizes for this service</span>
                                  <div className="chips">
                                    {sv.ratios.map((r) => (
                                      <button type="button" key={r} className={`chip sm${line.ratios.includes(r) ? ' on' : ''}`}
                                        onClick={() => toggleRatio(picked, setPicked, sv.key, r)}>{r}</button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="field">
                    <label>Choose your sizes for the {plan} package</label>
                    <div className="svc-list">
                      {(PLAN_CONTENTS[plan] || []).map((c) => (
                        <div className="svc on" key={c.key}>
                          <div className="svc-head" style={{ cursor: 'default' }}>
                            <span className="svc-name">{c.label}</span>
                          </div>
                          <div className="svc-body">
                            <div className="svc-ratios">
                              <span className="svc-qty-lab">Pick the size(s) you want</span>
                              <div className="chips">
                                {c.ratios.map((r) => (
                                  <button type="button" key={r} className={`chip sm${(planRatios[c.key] || []).includes(r) ? ' on' : ''}`}
                                    onClick={() => togglePlanRatio(c.key, r)}>{r}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ height: 30 }} />
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
            <p className="modal-lede">Pick each service, set the quantity, and choose the sizes you want for it. The price updates as you go.</p>
            {SERVICES.map((sv) => {
              const line = build[sv.key]
              const on = line.qty > 0
              return (
                <div className={`bsvc${on ? ' on' : ''}`} key={sv.key}>
                  <div className="bitem">
                    <div className="bitem-info"><h4>{sv.label}</h4><p>${sv.price} each</p></div>
                    <div className="stepper">
                      <button onClick={() => setQty(build, setBuild, sv.key, -1)} disabled={line.qty === 0} aria-label="Decrease">−</button>
                      <span className="qty">{line.qty}</span>
                      <button onClick={() => setQty(build, setBuild, sv.key, 1)} aria-label="Increase">+</button>
                    </div>
                  </div>
                  {on && (
                    <div className="bratios">
                      <span className="svc-qty-lab">Sizes for this service</span>
                      <div className="chips">
                        {sv.ratios.map((r) => (
                          <button type="button" key={r} className={`chip sm${line.ratios.includes(r) ? ' on' : ''}`}
                            onClick={() => toggleRatio(build, setBuild, sv.key, r)}>{r}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div className="btotal">
              <div className="sum"><span className="lab">Your total</span>${buildTotal}</div>
              <button className="cta" onClick={() => { setBuilderOpen(false); setPlan('Custom'); formRef.current?.scrollIntoView({ behavior: 'smooth' }) }}>
                Continue with this
              </button>
            </div>
            {buildTotal > 0 && buildTotal < MIN_ORDER && <p className="bmin">Minimum order is ${MIN_ORDER}. Add a little more to continue.</p>}
          </div>
        </div>
      )}
    </>
  )
}
