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

const Hero = () => {
  return (
    <section className="relative overflow-hidden px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col justify-center gap-16 lg:flex-row lg:items-center lg:gap-24">
        <motion.div
          className="flex w-full flex-col gap-8 lg:w-1/2"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div variants={item} className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-[#00E5FF] shadow-[0_0_40px_rgba(0,229,255,0.18)] backdrop-blur-sm">
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

          <motion.div variants={item} className="w-full max-w-2xl">
            <form className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label htmlFor="product-link" className="sr-only">
                Product link
              </label>
              <input
                id="product-link"
                type="url"
                placeholder="Paste your product link here..."
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-slate-500 outline-none ring-1 ring-transparent transition focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#00E5FF] px-6 py-4 text-sm font-semibold text-slate-950 shadow-neon transition hover:bg-[#00ccff]"
              >
                Engineer My Ad
              </button>
            </form>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative flex w-full justify-center lg:w-1/2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-72 w-72 rounded-full bg-[#00E5FF]/10 blur-3xl opacity-70" />
          </div>

          <motion.div
            className="relative z-10 w-full max-w-[380px]"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative overflow-hidden rounded-[44px] border border-white/10 bg-[#08101c] shadow-[0_30px_120px_-30px_rgba(0,229,255,0.35)]">
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#07101a] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.45)]" />
                <span className="h-3 w-3 rounded-full bg-slate-500/70" />
                <span className="h-3 w-3 rounded-full bg-slate-500/70" />
              </div>
              <div className="bg-[#05101a] p-5">
                <div className="relative mx-auto h-[650px] max-h-[650px] w-[280px] overflow-hidden rounded-[34px] border border-white/10 bg-[#03101a] shadow-inner">
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#00E5FF]/20 via-transparent to-transparent" />
                  <div className="flex h-full flex-col justify-between p-5">
                    <div className="space-y-4">
                      <div className="h-2.5 w-28 rounded-full bg-white/10" />
                      <div className="h-2.5 w-20 rounded-full bg-white/10" />
                      <div className="mt-12 h-64 rounded-[28px] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-inner" />
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                      <div>
                        <p className="font-semibold text-white">Product Teaser</p>
                        <p className="text-slate-500">Preview of your next ad</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_24px_rgba(0,229,255,0.16)]">
                        ▶
                      </div>
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
