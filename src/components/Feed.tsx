const feedItems = [
  {
    title: 'Launch Day Performance',
    metric: '5.8x ROAS',
    sub: 'Increased click-through and conversion intent.',
    color: 'from-[#00E5FF] to-blue-500',
  },
  {
    title: 'Brand Story Ad',
    metric: '41% View Rate',
    sub: 'Cinematic storytelling that keeps shoppers watching.',
    color: 'from-teal-400 to-cyan-500',
  },
  {
    title: 'UGC Sellout Reel',
    metric: '3.2x ROAS',
    sub: 'Authentic product moments built for scroll-stopping virality.',
    color: 'from-violet-500 to-fuchsia-500',
  },
]

const Feed = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-[#00E5FF]">
              Vertical Feed Deck
            </span>
            <h2 className="text-4xl font-black text-white sm:text-5xl">
              Scrollable ad examples built like real feed content.
            </h2>
          </div>
          <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
            Realistic vertical creative previews with performance overlays that feel native to TikTok and Reels.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-[#08101a] shadow-[0_40px_120px_-50px_rgba(0,229,255,0.25)]">
          <div className="max-h-[620px] overflow-y-auto px-4 py-6 sm:px-6">
            <div className="space-y-5">
              {feedItems.map((item) => (
                <div key={item.title} className="rounded-[28px] border border-white/10 bg-[#0d1524] p-5 shadow-[0_20px_80px_-50px_rgba(0,229,255,0.18)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Ad Example</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                    </div>
                    <div className={`rounded-3xl bg-gradient-to-r ${item.color} px-4 py-2 text-sm font-semibold text-slate-950`}>
                      {item.metric}
                    </div>
                  </div>
                  <div className="mt-5 rounded-[24px] bg-gradient-to-b from-[#06101a] to-[#08111e] p-4">
                    <div className="h-56 rounded-[24px] bg-[#07121e] shadow-[inset_0_0_60px_rgba(0,0,0,0.15)]" />
                  </div>
                  <p className="mt-4 text-slate-400">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Feed
