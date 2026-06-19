import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/licencia-armas-app/',
  plugins: [react()],
  server: {
    host: true,
  },
})
