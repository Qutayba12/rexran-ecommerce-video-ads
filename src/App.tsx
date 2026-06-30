import { useEffect, useState } from 'react'
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

const VIDEO_RATIOS = ['9:16', '16:9', '1:1', '21:9', '4:3', '3:4']
const IMAGE_RATIOS = ['1:1', '16:9', '9:16', '3:2', '2:3']

type Service = { key: string; label: string; price: number; ratios: string[] }
const SERVICES: Service[] = [
  { key: 'ugc', label: 'UGC Video Ad', price: 49, ratios: VIDEO_RATIOS },
  { key: 'cine', label: 'Cinematic Film', price: 79, ratios: VIDEO_RATIOS },
  { key: 'static', label: 'Static Ad Image', price: 12, ratios: IMAGE_RATIOS },
  { key: 'shoot', label: 'Product Photoshoot', price: 18, ratios: IMAGE_RATIOS },
]
const MIN_ORDER = 25

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

const PLAN_CONTENTS: Record<string, { key: string; label: string; ratios: string[] }[]> = {
  Spark: [{ key: 'ugc', label: 'UGC video', ratios: VIDEO_RATIOS }, { key: 'static', label: 'Static ad image', ratios: IMAGE_RATIOS }],
  Growth: [{ key: 'ugc', label: 'UGC video', ratios: VIDEO_RATIOS }, { key: 'static', label: 'Static ad images', ratios: IMAGE_RATIOS }],
  Scale: [{ key: 'ugc', label: 'UGC videos', ratios: VIDEO_RATIOS }, { key: 'cine', label: 'Cinematic film', ratios: VIDEO_RATIOS }, { key: 'static', label: 'Static ad images', ratios: IMAGE_RATIOS }],
  'Brand Partner': [{ key: 'ugc', label: 'UGC videos', ratios: VIDEO_RATIOS }, { key: 'cine', label: 'Cinematic film', ratios: VIDEO_RATIOS }, { key: 'static', label: 'Static ad images', ratios: IMAGE_RATIOS }],
}

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

const WHY = [
  { t: 'No studio, no crew', p: 'You skip the photographer, the actors, the editor, and the week of back-and-forth. One link in, finished ads out.' },
  { t: 'Built to convert', p: 'Every asset leads with a hook and is sized natively for the feed — made to stop the scroll, not just look pretty.' },
  { t: '48-hour turnaround', p: 'Most agencies take two weeks. You get launch-ready creative in two days, straight to your DMs.' },
  { t: 'Done entirely for you', p: 'No tool to learn, no prompts to write. You approve the brief, I handle the rest end to end.' },
]

const REVIEWS = [
  { q: 'First UGC video we ran beat our agency creative on day one. CPA dropped about 30% in the first week.', n: 'Marcus T.', r: 'DTC skincare founder' },
  { q: 'I sent one product link and got back three scroll-stopping ads in two days. No calls, no briefs, no chaos.', n: 'Lena R.', r: 'Shopify apparel store' },
  { q: 'The cinematic film made our $40 product look like a $400 one. It completely changed how people see the brand.', n: 'Devin K.', r: 'Home & lifestyle brand' },
  { q: 'Cheaper than one freelancer, faster than any agency, and the quality is honestly better than both.', n: 'Priya S.', r: 'Supplements DTC' },
]

type Line = { qty: number; ratios: string[] }
const emptyLines = (): Record<string, Line> => Object.fromEntries(SERVICES.map((s) => [s.key, { qty: 0, ratios: [] }]))

export default function App() {
  useReveal()
  const scrolled = useScrolled()

  // checkout modal: which plan ('Spark'..) or 'Custom'
  const [checkout, setCheckout] = useState<string | null>(null)
  const [step, setStep] = useState(0) // 0 sizes, 1 info, 2 pay, 3 done

  // ready-plan size choices
  const [planRatios, setPlanRatios] = useState<Record<string, string[]>>({ ugc: ['9:16'], cine: ['16:9'], static: ['1:1'] })
  const togglePlanRatio = (k: string, r: string) =>
    setPlanRatios((p) => { const c = p[k] || []; return { ...p, [k]: c.includes(r) ? c.filter((x) => x !== r) : [...c, r] } })

  // custom builder lines
  const [build, setBuild] = useState<Record<string, Line>>(() => ({ ...emptyLines(), ugc: { qty: 1, ratios: ['9:16'] }, static: { qty: 2, ratios: ['1:1'] } }))
  const setQty = (state: Record<string, Line>, set: (v: Record<string, Line>) => void, key: string, d: number) => {
    const q = Math.max(0, state[key].qty + d); set({ ...state, [key]: { qty: q, ratios: q === 0 ? [] : state[key].ratios } })
  }
  const toggleRatio = (state: Record<string, Line>, set: (v: Record<string, Line>) => void, key: string, r: string) => {
    const line = state[key]; const ratios = line.ratios.includes(r) ? line.ratios.filter((x) => x !== r) : [...line.ratios, r]
    set({ ...state, [key]: { ...line, ratios } })
  }
  const buildTotal = SERVICES.reduce((s, sv) => s + build[sv.key].qty * sv.price, 0)

  const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  // client details
  const [info, setInfo] = useState({ brand: '', productUrl: '', instagram: '', email: '', language: 'English', notes: '' })
  const setField = (k: string, v: string) => setInfo((s) => ({ ...s, [k]: v }))
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr] = useState('')

  // portfolio videos from admin
  const [videos, setVideos] = useState<{ id: string; title: string; url: string; type: string; poster?: string }[]>([])
  useEffect(() => {
    fetch('/api/videos').then((r) => r.json()).then((d) => setVideos(d.videos || [])).catch(() => {})
  }, [])

  const open = (plan: string) => { setCheckout(plan); setStep(0) }
  const close = () => { setCheckout(null); setStep(0); setSubmitErr('') }

  const isCustom = checkout === 'Custom'
  const planObj = PLANS.find((p) => p.name === checkout)
  const planTotal = isCustom ? buildTotal : (planObj ? parseInt(planObj.price.replace('$', '')) : 0)

  // assemble services & sizes for the order
  const orderItems = () => {
    if (isCustom) {
      return SERVICES.filter((sv) => build[sv.key].qty > 0).map((sv) => ({
        label: sv.label, qty: build[sv.key].qty, ratios: build[sv.key].ratios,
      }))
    }
    return (PLAN_CONTENTS[checkout!] || []).map((c) => ({
      label: c.label, qty: 0, ratios: planRatios[c.key] || [],
    }))
  }

  const submitOrder = async () => {
    setSubmitting(true); setSubmitErr('')
    try {
      const payload = {
        package: isCustom ? 'Custom' : checkout,
        total: planTotal,
        brand: info.brand, productUrl: info.productUrl, instagram: info.instagram,
        email: info.email, language: info.language, notes: info.notes,
        items: orderItems(),
      }
      const r = await fetch('/api/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error('send failed')
      setStep(3)
    } catch {
      setSubmitErr('Could not send your order. Please try again or DM us on Instagram.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="stage">
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="mesh" />
      </div>
      <div className="grain" />

      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <a className="brand" href="#top"><RexMark className="brand-logo" />Rexran</a>
        <a className="nav-cta" href="#pricing">Start a project</a>
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
          <a className="cta" href="#pricing">Start a project</a>
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
          {videos.length > 0 && (
            <div className="vid-grid reveal">
              {videos.map((v) => (
                <figure className="vid-card" key={v.id}>
                  <video src={v.url} poster={v.poster || undefined} controls playsInline preload="metadata" />
                  <figcaption><span className="vid-type">{v.type}</span><span className="vid-title">{v.title}</span></figcaption>
                </figure>
              ))}
            </div>
          )}
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
                <button className={`cta${p.feat ? '' : ' ghost'}`} onClick={() => open(p.name)}>Choose {p.name}</button>
              </div>
            ))}
          </div>
          <div className="builder-row reveal">
            <button className="builder-trigger" onClick={() => open('Custom')}>
              <span className="plus">+</span> Build your own package
            </button>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="sec" id="why">
        <div className="wrap">
          <div className="reveal">
            <div className="sec-tag">Why Rexran</div>
            <h2 className="sec-h">Agency-grade creative, <em>without the agency.</em></h2>
          </div>
          <div className="why-grid reveal">
            {WHY.map((w, i) => (
              <div className="why-card" key={w.t}>
                <div className="why-n">0{i + 1}</div>
                <h3>{w.t}</h3><p>{w.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="sec" id="reviews">
        <div className="wrap">
          <div className="reveal">
            <div className="sec-tag">Client Results</div>
            <h2 className="sec-h">Brands that stopped <em>the scroll.</em></h2>
          </div>
          <div className="rev-grid reveal">
            {REVIEWS.map((rv) => (
              <figure className="rev-card" key={rv.n}>
                <div className="rev-stars">★★★★★</div>
                <blockquote>"{rv.q}"</blockquote>
                <figcaption><span className="rev-name">{rv.n}</span><span className="rev-role">{rv.r}</span></figcaption>
              </figure>
            ))}
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

      {/* CHECKOUT MODAL (multi-step) */}
      {checkout && (
        <div className="modal-back" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={close} aria-label="Close">✕</button>

            {/* progress */}
            <div className="steps-bar">
              {['Sizes', 'Details', 'Payment'].map((lab, i) => (
                <div className={`stepdot${step === i ? ' on' : ''}${step > i ? ' done' : ''}`} key={lab}>
                  <span className="d">{step > i ? '✓' : i + 1}</span>{lab}
                </div>
              ))}
            </div>

            {/* header */}
            <h3>{isCustom ? <>Build <em>your own.</em></> : <>{checkout} <em>package.</em></>}</h3>

            {/* STEP 0 — SIZES */}
            {step === 0 && (
              <>
                {isCustom ? (
                  <>
                    <p className="modal-lede">Pick each service, set the quantity, and choose its sizes. Price updates live.</p>
                    {SERVICES.map((sv) => {
                      const line = build[sv.key]; const on = line.qty > 0
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
                  </>
                ) : (
                  <>
                    <p className="modal-lede">Choose the size(s) you want for each part of your {checkout} package.</p>
                    {(PLAN_CONTENTS[checkout!] || []).map((c) => (
                      <div className="bsvc on" key={c.key}>
                        <div className="bitem"><div className="bitem-info"><h4>{c.label}</h4></div></div>
                        <div className="bratios">
                          <span className="svc-qty-lab">Pick the size(s) you want</span>
                          <div className="chips">
                            {c.ratios.map((r) => (
                              <button type="button" key={r} className={`chip sm${(planRatios[c.key] || []).includes(r) ? ' on' : ''}`}
                                onClick={() => togglePlanRatio(c.key, r)}>{r}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <div className="btotal">
                  <div className="sum"><span className="lab">{isCustom ? 'Your total' : 'Package price'}</span>${planTotal}</div>
                  <button className="cta" disabled={isCustom && buildTotal < MIN_ORDER} onClick={() => setStep(1)}>Continue</button>
                </div>
                {isCustom && buildTotal > 0 && buildTotal < MIN_ORDER && <p className="bmin">Minimum order is ${MIN_ORDER}. Add a little more to continue.</p>}
              </>
            )}

            {/* STEP 1 — DETAILS */}
            {step === 1 && (
              <>
                <p className="modal-lede">Tell me about the product so I can produce the right creative.</p>
                <div className="fgrid two">
                  <div className="field"><label>Brand / store name</label><input value={info.brand} onChange={(e) => setField('brand', e.target.value)} placeholder="Acme Supply Co." /></div>
                  <div className="field"><label>Product link</label><input type="url" value={info.productUrl} onChange={(e) => setField('productUrl', e.target.value)} placeholder="https://…/your-product" /></div>
                </div>
                <div style={{ height: 22 }} />
                <div className="fgrid two">
                  <div className="field"><label>Instagram handle</label><input value={info.instagram} onChange={(e) => setField('instagram', e.target.value)} placeholder="@yourstore" /></div>
                  <div className="field"><label>Email</label><input type="email" value={info.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@store.com" /></div>
                </div>
                <div style={{ height: 22 }} />
                <div className="field"><label>Primary language</label>
                  <select value={info.language} onChange={(e) => setField('language', e.target.value)}><option>English</option><option>Arabic</option><option>Bilingual</option><option>Other</option></select>
                </div>
                <div style={{ height: 22 }} />
                <div className="field"><label>Product details & what to highlight</label><textarea value={info.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="What it is, who it's for, the angle or offer to push, any text or logo that must appear…" /></div>
                <div className="modal-nav">
                  <button className="cta ghost" onClick={() => setStep(0)}>Back</button>
                  <button className="cta" onClick={() => setStep(2)}>Continue to payment</button>
                </div>
              </>
            )}

            {/* STEP 2 — PAYMENT */}
            {step === 2 && (
              <>
                <p className="modal-lede">Review and pay securely. Your files arrive in your DMs within 48 hours.</p>
                <div className="pay-sum">
                  <div className="pay-row"><span>{isCustom ? 'Custom package' : `${checkout} package`}</span><strong>${planTotal}</strong></div>
                  <div className="pay-row muted"><span>Delivery</span><span>48 hours · Instagram DMs</span></div>
                </div>
                <div className="fgrid"><div className="field"><label>Card number</label><input placeholder="1234 5678 9012 3456" disabled /></div></div>
                <div style={{ height: 22 }} />
                <div className="fgrid two">
                  <div className="field"><label>Expiry</label><input placeholder="MM / YY" disabled /></div>
                  <div className="field"><label>CVC</label><input placeholder="123" disabled /></div>
                </div>
                <p className="bmin" style={{ textAlign: 'left', marginTop: 18 }}>Preview only — secure Stripe checkout connects here. No payment is taken yet.</p>
                {submitErr && <p className="bmin" style={{ textAlign: 'left', color: '#e6896b' }}>{submitErr}</p>}
                <div className="modal-nav">
                  <button className="cta ghost" onClick={() => setStep(1)} disabled={submitting}>Back</button>
                  <button className="cta" onClick={submitOrder} disabled={submitting}>{submitting ? 'Sending…' : `Pay $${planTotal}`}</button>
                </div>
              </>
            )}

            {/* STEP 3 — DONE */}
            {step === 3 && (
              <div className="done" style={{ marginTop: 10 }}>
                <span className="dot" />
                <p>That's the flow! Once Stripe is connected this completes the order and I confirm in your DMs with a timeline.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
