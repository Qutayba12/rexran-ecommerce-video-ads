import { useMemo, useState } from 'react'

type PricingProps = {
  onOrder: () => void
}

const plans = [
  {
    name: 'Tester',
    price: '$1.2k',
    description: 'Test the market with one high-converting ad.',
    features: ['1 Ad concept', 'Basic editing', 'Fast turnaround'],
  },
  {
    name: 'Launch',
    price: '$3.5k',
    description: 'Launch your first campaign with premium creative.',
    features: ['3 Ad concepts', 'UGC + Motion', 'Analytics-ready'],
  },
  {
    name: 'Scale',
    price: '$6.2k',
    description: 'Scale with a full creative suite and paid media-ready assets.',
    features: ['5 Ad concepts', 'Cinematic edits', 'Retargeting cuts'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Full team support, custom strategy, and rapid iteration.',
    features: ['Dedicated creative engine', 'Priority delivery', 'Ongoing optimization'],
  },
]

const baseRates = {
  ugc: 450,
  cinematic: 650,
  photos: 250,
  static: 190,
}

const Pricing = ({ onOrder }: PricingProps) => {
  const [counts, setCounts] = useState({ ugc: 0, cinematic: 0, photos: 0, static: 0 })

  const total = useMemo(
    () =>
      counts.ugc * baseRates.ugc +
      counts.cinematic * baseRates.cinematic +
      counts.photos * baseRates.photos +
      counts.static * baseRates.static,
    [counts],
  )

  const updateCount = (key: keyof typeof counts, delta: number) => {
    setCounts((current) => ({
      ...current,
      [key]: Math.max(0, current[key] + delta),
    }))
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-[#00E5FF]">
              Fixed Blueprints
            </span>
            <h2 className="text-4xl font-black text-white sm:text-5xl">
              Pricing built for predictable growth.
            </h2>
            <p className="max-w-xl text-lg text-slate-400 sm:text-xl">
              Choose a tested plan or configure the exact creative blend your brand needs.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan.name} className="rounded-[28px] border border-white/10 bg-[#07101a] p-6 shadow-[0_20px_80px_-50px_rgba(0,229,255,0.25)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{plan.name}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">{plan.price}</h3>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{plan.name === 'Enterprise' ? 'Custom' : 'Popular'}</span>
                  </div>
                  <p className="mt-5 text-slate-400">{plan.description}</p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-300">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#00E5FF]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={onOrder}
                    className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#00E5FF] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#00ccff]"
                  >
                    Order Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#08101a] p-6 shadow-[0_30px_100px_-60px_rgba(0,229,255,0.25)]">
            <div className="flex items-center justify-between rounded-3xl bg-white/5 px-5 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Custom Engine</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Build your ideal package</h3>
              </div>
              <div className="rounded-3xl bg-[#0B1221] px-4 py-2 text-sm text-slate-300">Live price</div>
            </div>
            <div className="mt-8 space-y-5">
              {(
                Object.keys(counts) as Array<keyof typeof counts>
              ).map((option) => (
                <div key={option} className="rounded-3xl border border-white/10 bg-[#0b172a] px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{option === 'ugc' ? 'UGC' : option === 'cinematic' ? 'Cinematic' : option === 'photos' ? 'Photos' : 'Static Ads'}</p>
                      <p className="mt-1 text-sm text-slate-500">${baseRates[option]} each</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-full bg-white/5 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => updateCount(option, -1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-[#00E5FF]/50"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-lg font-semibold text-white">{counts[option]}</span>
                      <button
                        type="button"
                        onClick={() => updateCount(option, 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-[#00E5FF]/50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[28px] border border-[#00E5FF]/15 bg-[#07101a] p-6 text-white shadow-[0_20px_50px_-30px_rgba(0,229,255,0.25)]">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Total estimate</span>
                <span className="font-semibold text-white">${total.toLocaleString()}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                This estimate updates as you choose more creative assets for your campaign.
              </p>
            </div>
            <button
              type="button"
              onClick={onOrder}
              className="mt-6 w-full rounded-full bg-[#00E5FF] px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-[#00ccff]"
            >
              Order the Engine
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing
