import { defineConfig, devices } from '@playwright/test'

const PORT = 8123
const isCI = Boolean(process.env.CI)

// Set E2E_BASE_URL to test a running stack (CI: the Docker container on :8080).
// Without it, a local PHP server is started against the last `npm run build`.
const externalBaseUrl = process.env.E2E_BASE_URL

/**
 * End-to-end tests: the built React app served by the real Laravel API, in
 * production mode. See docs/engenharia.md.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  // The pages read the catalogue from the API (VITE_DATA_SOURCE=api); locally PHP's built-in server answers one
  // request at a time for all the parallel tests, so the first answers (before the cache) can take a few seconds.
  expect: { timeout: 15_000 },
  use: {
    baseURL: externalBaseUrl ?? `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      // Most users are on Android phones, set to Portuguese in Luanda.
      name: 'android',
      use: {
        ...devices['Pixel 7'],
        locale: 'pt-AO',
        timezoneId: 'Africa/Luanda',
        channel: isCI ? undefined : 'msedge',
      },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        // PHP's built-in server with Laravel's router script. Not `artisan serve`:
        // it drops environment variables, and these must reach the app.
        // Laravel's server.php behind e2e/server.php, which adds the service worker's header (no .htaccess here).
        // First the test database gets the whole catalogue (the build reads it from /api/v1, VITE_DATA_SOURCE=api).
        // Then the panel's test admin (E2E_ADMIN_*, e2e/admin.spec.ts); the panel's theme is the last
        // `npm run build` in apps/api.
        command: `php ../artisan migrate:fresh --force --no-interaction && php ../artisan kaye:import --no-interaction && php ../artisan db:seed --class=E2eAdminSeeder --force --no-interaction && php -S 127.0.0.1:${PORT} ../../web/e2e/server.php`,
        cwd: '../api/public',
        url: `http://127.0.0.1:${PORT}/up`,
        // Production mode (no debug pages, no dev tools injecting scripts), on the test database.
        env: {
          APP_ENV: 'production',
          APP_DEBUG: 'false',
          DB_DATABASE: process.env.DB_DATABASE ?? 'kaye_test',
          // The same test admin as compose.yaml (local and CI only).
          ADMIN_EMAILS: 'admin@kaye.test',
          E2E_ADMIN_PASSWORD: 'e2e-only-password',
          E2E_ADMIN_TOTP_SECRET: 'JBSWY3DPEHPK3PXP',
        },
        reuseExistingServer: !isCI,
        // The PHP server logs every request to stderr.
        stderr: 'ignore',
        // The import of the catalogue takes about a minute.
        timeout: 240_000,
      },
})
