import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        thankyou: resolve(__dirname, 'thank-you.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        delivery: resolve(__dirname, 'delivery.html'),
        studio: resolve(__dirname, 'studio.html'),
        guides: resolve(__dirname, 'guides.html'),
        guideUgc: resolve(__dirname, 'guide-ugc-vs-traditional.html'),
        guideAi: resolve(__dirname, 'guide-ai-directed-vs-generated.html'),
        guideRatios: resolve(__dirname, 'guide-aspect-ratios.html'),
        guideSpeed: resolve(__dirname, 'guide-fast-turnaround.html'),
      },
    },
  },
})
