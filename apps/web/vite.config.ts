/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// The same app is built three ways:
// - web (default): served by Laravel at /, assets under /spa, output in apps/api/public/spa
// - native (`vite build --mode native`): bundled into the Capacitor apps, output in dist/
// - static (`vite build --mode static`): a static site at / for test hosting (Vercel), output in dist/
export default defineConfig(({ command, mode }) => {
  const standalone = mode === 'native' || mode === 'static'
  const base = command === 'build' && !standalone ? '/spa/' : '/'

  return {
    plugins: [react(), tailwindcss(), pwa(base, mode === 'native')],
    base,
    build: {
      outDir: standalone ? 'dist' : '../api/public/spa',
      emptyOutDir: true,
    },
    server: {
      // In development the API runs on `php artisan serve` (port 8000).
      proxy: { '/api': 'http://127.0.0.1:8000' },
      // src/data/export.test.ts reads the exported content (public, the same as the app's) next to the API.
      fs: { allow: ['.', '../api/database/data'] },
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
        // Below the 90/85 of ADR 0001 until prompt 10, rising at each step (ADR 0020): it may only go up.
        thresholds: { statements: 82, branches: 70, functions: 79, lines: 83 },
      },
    },
  }
})

/**
 * The installable web app: a manifest and a service worker that keeps the code for offline use.
 * The pages always live at / (Laravel serves them there even when the files sit in /spa/), so the
 * scope is / in every build; from /spa/sw.js that needs the `Service-Worker-Allowed: /` header.
 * The Android app (Capacitor) has its own files on the phone: no service worker there.
 */
function pwa(base: string, native: boolean) {
  return VitePWA({
    disable: native,
    registerType: 'prompt',
    // Registered by hand (src/app/AppStatus.tsx), only on the web, never inside the Android app.
    injectRegister: false,
    scope: '/',
    // The manifest icons go in by themselves; these are the ones index.html links to.
    includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
    manifest: {
      name: 'Kayé',
      short_name: 'Kayé',
      description:
        'Descobre o teu lugar na tecnologia: o que cada profissão exige, onde estudar e como lá chegar.',
      lang: 'pt',
      dir: 'ltr',
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      // index.css tokens: --color-navy (the bar and splash) and --color-paper (the page).
      theme_color: '#1b2a43',
      background_color: '#f7f4ee',
      icons: [
        { src: `${base}pwa-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: `${base}pwa-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: `${base}pwa-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // The code, the styles, the fonts and the icons: about 3 MB, kept for offline use.
      // Not the photos (about 50 MB in .webp), nor the voice files or the CV fonts (public/voice, public/fonts).
      globPatterns: ['index.html', 'assets/**/*.{js,css,woff2,svg,png}'],
      // source.js (the demo data) is about 1.1 MB.
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      navigateFallback: `${base}index.html`,
      // /api answers itself; /admin is Laravel's panel (Filament); /auth is the Google login, which must
      // reach Laravel and Google, never the app's cached page.
      navigateFallbackDenylist: [/^\/api\//, /^\/admin/, /^\/auth\//],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          // Photos already seen open offline; the oldest go first so the phone's storage stays small.
          urlPattern: ({ request, url }) => request.destination === 'image' && url.pathname.endsWith('.webp'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'kaye-photos',
            expiration: { maxEntries: 150, maxAgeSeconds: 30 * 24 * 60 * 60, purgeOnQuotaError: true },
            cacheableResponse: { statuses: [200] },
          },
        },
        {
          // Never cached: some answers carry the person's data. The public catalogue endpoints
          // (careers, courses, academies...) will move to StaleWhileRevalidate in their own rule.
          urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
          handler: 'NetworkOnly',
        },
      ],
    },
  })
}
