import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.16,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

type HeroProps = {
  onOrder: () => void
}

const Hero = ({ onOrder }: HeroProps) => {
  return (
    <section className="relative overflow-hidden px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <motion.div
          className="flex w-full flex-col gap-8"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-[#00E5FF] shadow-[0_0_40px_rgba(0,229,255,0.18)] backdrop-blur-sm"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/10 text-lg font-black text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.35)]">
              R
            </span>
            Rexran
          </motion.div>

          <motion.div variants={item} className="space-y-6">
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Stop the Scroll.
              <span className="block bg-gradient-to-r from-[#00E5FF] to-blue-600 bg-clip-text text-transparent">
                Scale Your Brand.
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-400 sm:text-xl">
              High-converting UGC, Cinematic, and Static Ads built for e-commerce brands.
            </p>
          </motion.div>

          <motion.div variants={item} className="w-full max-w-3xl">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                onOrder()
              }}
              className="flex flex-col gap-4 rounded-full bg-white/5 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:flex-row"
            >
              <input
                id="product-link"
                type="url"
                placeholder="Paste your product link here..."
                className="min-w-0 flex-1 rounded-full border border-transparent bg-transparent px-5 py-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-transparent focus:ring-0"
              />
              <button
                type="submit"
                className="inline-flex h-full items-center justify-center rounded-full bg-[#00E5FF] px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-[#00ccff] sm:min-w-[180px]"
              >
                Engineer My Ad
              </button>
            </form>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative flex w-full justify-center lg:justify-end"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-72 w-72 rounded-full bg-[#00E5FF]/10 blur-3xl opacity-70" />
          </div>

          <motion.div
            className="relative z-10 w-full max-w-[360px]"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#07101a] shadow-[0_30px_120px_-30px_rgba(0,229,255,0.25)]">
              <div className="border-b border-white/10 bg-[#08101d] px-4 py-3">
                <div className="mx-auto h-1.5 w-20 rounded-full bg-white/10" />
              </div>
              <div className="p-5">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-inner">
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                  <div className="h-[520px] rounded-[28px] bg-[#090d14] p-5 text-white">
                    <div className="mb-6 flex items-center justify-between rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                      <span className="font-semibold text-white">Rexran Studio</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">Live</span>
                    </div>
                    <div className="space-y-4">
                      <div className="h-3 w-24 rounded-full bg-white/10" />
                      <div className="h-3 w-16 rounded-full bg-white/10" />
                    </div>
                    <div className="mt-8 h-[320px] rounded-[28px] bg-gradient-to-b from-[#07101a] via-[#09101c] to-[#061017] p-5 shadow-inner">
                      <div className="h-full rounded-[24px] bg-[#0f1726] shadow-[inset_0_0_50px_rgba(0,229,255,0.08)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
