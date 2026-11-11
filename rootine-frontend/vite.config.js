import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The API's CORS allowlist expects this exact origin; fail fast instead of silently using another port
  server: { port: 5173, strictPort: true },
})
