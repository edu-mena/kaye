import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The same app is built twice:
// - web (default): served by Laravel at /, assets under /spa, output in apps/api/public/spa
// - native (`vite build --mode native`): bundled into the Capacitor apps, output in dist/
export default defineConfig(({ command, mode }) => {
  const native = mode === 'native'

  return {
    plugins: [react(), tailwindcss()],
    base: command === 'build' && !native ? '/spa/' : '/',
    build: {
      outDir: native ? 'dist' : '../api/public/spa',
      emptyOutDir: true,
    },
    server: {
      // In development the API runs on `php artisan serve` (port 8000).
      proxy: { '/api': 'http://127.0.0.1:8000' },
    },
  }
})
