import { useState } from 'react'
import Hero from './components/Hero'
import BeforeAfter from './components/BeforeAfter'
import Feed from './components/Feed'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import IntakeModal from './components/IntakeModal'

const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'
const TELEGRAM_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID'
const STRIPE_CHECKOUT_URL = 'https://example.com/checkout'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [thankYou, setThankYou] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState({
    firstName: '',
    instagram: '',
    productUrl: '',
    adLanguage: 'English',
  })

  const openOrderModal = () => {
    setError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setLoading(false)
    setError(null)
  }

  const onChange = (field: string, value: string) => {
    setOrder((prev) => ({ ...prev, [field]: value }))
  }

  const onConfirm = async () => {
    if (!order.productUrl) {
      setError('Product URL is required.')
      return
    }

    setLoading(true)
    setError(null)

    const message = `*New Rexran Order*%0A*Name:* ${order.firstName || '—'}%0A*Instagram:* ${order.instagram || '—'}%0A*Product URL:* ${order.productUrl}%0A*Ad Language:* ${order.adLanguage}`

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }),
      })
    } catch (err) {
      setError('Unable to send order alert. Please try again.')
      setLoading(false)
      return
    }

    setTimeout(() => {
      window.location.href = STRIPE_CHECKOUT_URL
      setLoading(false)
      setThankYou(true)
    }, 300)
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white">
      <Hero onOrder={openOrderModal} />
      <BeforeAfter />
      <Feed />
      <Pricing onOrder={openOrderModal} />
      <Footer />
      <IntakeModal
        open={modalOpen}
        order={order}
        loading={loading}
        error={error}
        thankYou={thankYou}
        onClose={closeModal}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    </main>
  )
}

export default App
