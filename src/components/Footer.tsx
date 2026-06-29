const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#090d16] py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 sm:px-8 lg:px-12 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">Rexran Media</p>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Premium e-commerce ad creative that turns scrolls into purchases.
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-400 lg:text-right">
          <p>Copyright © 2026 Rexran Media</p>
          <p>Built for ambitious brands who want scale-ready ads.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
