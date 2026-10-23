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
        command: `php -S 127.0.0.1:${PORT} ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php`,
        cwd: '../api/public',
        url: `http://127.0.0.1:${PORT}/up`,
        // Production mode (no debug pages, no dev tools injecting scripts), on the test database.
        env: {
          APP_ENV: 'production',
          APP_DEBUG: 'false',
          DB_DATABASE: process.env.DB_DATABASE ?? 'kaye_test',
        },
        reuseExistingServer: !isCI,
        // The PHP server logs every request to stderr.
        stderr: 'ignore',
        timeout: 60_000,
      },
})
