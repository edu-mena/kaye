/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The same app is built three ways:
// - web (default): served by Laravel at /, assets under /spa, output in apps/api/public/spa
// - native (`vite build --mode native`): bundled into the Capacitor apps, output in dist/
// - static (`vite build --mode static`): a static site at / for test hosting (Vercel), output in dist/
export default defineConfig(({ command, mode }) => {
  const standalone = mode === 'native' || mode === 'static'

  return {
    plugins: [react(), tailwindcss()],
    base: command === 'build' && !standalone ? '/spa/' : '/',
    build: {
      outDir: standalone ? 'dist' : '../api/public/spa',
      emptyOutDir: true,
    },
    server: {
      // In development the API runs on `php artisan serve` (port 8000).
      proxy: { '/api': 'http://127.0.0.1:8000' },
    },
    test: {
      environment: 'jsdom',
      // Whole pages under coverage on a busy machine went past the default 5 s; a real hang still fails.
      testTimeout: 15_000,
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
