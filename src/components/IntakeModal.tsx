import { motion } from 'framer-motion'

type IntakeModalProps = {
  open: boolean
  order: {
    firstName: string
    instagram: string
    productUrl: string
    adLanguage: string
  }
  loading: boolean
  error: string | null
  thankYou: boolean
  onClose: () => void
  onChange: (field: string, value: string) => void
  onConfirm: () => void
}

const IntakeModal = ({
  open,
  order,
  loading,
  error,
  thankYou,
  onClose,
  onChange,
  onConfirm,
}: IntakeModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#090d16]/95 p-8 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#00E5FF]">Rexran Intake</p>
            <h3 className="mt-3 text-2xl font-black text-white">Complete your order</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 transition hover:text-white">
            ✕
          </button>
        </div>

        {thankYou ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-[28px] border border-[#00E5FF]/10 bg-[#07101a] p-6 text-white shadow-[0_20px_80px_-40px_rgba(0,229,255,0.3)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[#00E5FF]">Thank you</p>
              <h4 className="mt-3 text-3xl font-bold">Your order is confirmed.</h4>
              <p className="mt-4 text-slate-400">A Rexran specialist will reach out via Instagram shortly. Let’s turn this campaign into the next big thing.</p>
            </div>
            <button
              type="button"
              onClick={() => window.open('https://instagram.com/rexran.media', '_blank')}
              className="w-full rounded-full bg-[#00E5FF] px-6 py-4 text-center text-sm font-semibold text-slate-950 transition hover:bg-[#00ccff]"
            >
              Let's start! Message us on Instagram
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">First Name</span>
                <input
                  value={order.firstName}
                  onChange={(event) => onChange('firstName', event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none transition focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20"
                  placeholder="Alex"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Instagram Handle</span>
                <input
                  value={order.instagram}
                  onChange={(event) => onChange('instagram', event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none transition focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20"
                  placeholder="@rexycreative"
                />
              </label>
            </div>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Product URL *</span>
              <input
                value={order.productUrl}
                onChange={(event) => onChange('productUrl', event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none transition focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20"
                placeholder="https://"
                required
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Ad Language</span>
              <select
                value={order.adLanguage}
                onChange={(event) => onChange('adLanguage', event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none transition focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </label>
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full rounded-full bg-[#00E5FF] px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-[#00ccff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Processing order...' : 'Confirm Order'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default IntakeModal
