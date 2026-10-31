import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { scopePortfolioCss } from './src/lib/scopePortfolioCss.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  css: { postcss: { plugins: [scopePortfolioCss()] } },
})
