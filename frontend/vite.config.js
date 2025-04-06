import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), compression({
    algorithm: 'gzip',
    ext: '.gz',
    deleteOriginFile: false,
    threshold: 1024
  })],
  define: {
    global: 'window',
  },
  server: {
    port: 5173,
    allowedHosts: []
  },
})
