const BeforeAfter = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.12)]">
              Ad Anatomy
            </span>
            <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl">
              Before vs After ad performance, reimagined.
            </h2>
            <p className="max-w-xl text-lg text-slate-400 sm:text-xl">
              See the difference between generic creative and ads engineered for higher engagement, stronger ROAS, and fast growth.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-50px_rgba(0,229,255,0.25)]">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Before</p>
              <div className="mt-5 rounded-[28px] bg-[#08101a] p-5">
                <div className="h-[260px] rounded-[24px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 shadow-inner">
                  <div className="h-full rounded-[24px] border border-white/5 bg-[#0b1320]" />
                </div>
              </div>
              <div className="mt-5 space-y-3 text-slate-300">
                <div className="flex items-center justify-between text-sm">
                  <span>CTR</span>
                  <span>0.72%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>CPA</span>
                  <span>$23.80</span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#00E5FF]/15 bg-[#07101a] p-6 shadow-[0_30px_80px_-50px_rgba(0,229,255,0.25)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[#00E5FF]">After</p>
              <div className="mt-5 rounded-[28px] bg-gradient-to-b from-[#05101b] via-[#08121f] to-[#04101a] p-5 shadow-inner">
                <div className="h-[260px] rounded-[24px] bg-[#08111b] p-4">
                  <div className="h-full rounded-[24px] bg-[#0c1828] shadow-[inset_0_0_40px_rgba(0,229,255,0.12)]" />
                </div>
              </div>
              <div className="mt-5 space-y-3 text-slate-300">
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>CTR</span>
                  <span>4.9%</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>CPA</span>
                  <span>$6.40</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BeforeAfter
