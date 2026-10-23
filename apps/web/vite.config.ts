/// <reference types="vitest/config" />
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
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        // main.tsx and router wiring are covered by the end-to-end tests (e2e/).
        exclude: ['src/main.tsx', 'src/app/App.tsx', 'src/app/router.tsx', 'src/test/**', 'src/**/*.d.ts'],
        thresholds: { statements: 90, branches: 85, functions: 90, lines: 90 },
      },
    },
  }
})
