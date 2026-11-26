import { createHmac } from 'node:crypto'
import { expect, test } from './fixtures'

// The panel's test admin (compose.yaml and playwright.config.ts write it with E2eAdminSeeder): local and CI only.
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@kaye.test'
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'e2e-only-password'
const SECRET = process.env.E2E_ADMIN_TOTP_SECRET ?? 'JBSWY3DPEHPK3PXP'

/** The 6-digit code an authenticator app shows now (RFC 6238: HMAC-SHA1, 30-second steps). */
function totp(secret: string, now = Date.now()): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bits = [...secret.replace(/=+$/, '').toUpperCase()]
    .map((char) => alphabet.indexOf(char).toString(2).padStart(5, '0'))
    .join('')
  const key = Buffer.from(bits.match(/.{8}/g)?.map((byte) => parseInt(byte, 2)) ?? [])
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30_000)))
  const hmac = createHmac('sha1', key).update(counter).digest()
  const offset = (hmac.at(-1) ?? 0) & 0xf
  return ((hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0')
}

test.describe('admin panel', () => {
  test('the team signs in with the second factor and an edit reaches the app', async ({
    page,
    consoleErrors,
  }) => {
    // Two apps in one test (the panel, then the app), on a single-threaded PHP server locally.
    test.setTimeout(120_000)
    await page.goto('/admin/login')
    await page.locator('input[type="email"]').fill(EMAIL)
    await page.locator('input[type="password"]').fill(PASSWORD)
    await page.getByRole('button', { name: 'Iniciar sessão' }).click()

    // The second factor: the code of the authenticator app.
    const code = page.locator('input[autocomplete="one-time-code"]')
    await expect(code).toBeVisible()
    await code.fill(totp(SECRET))
    if (await page.getByRole('button', { name: 'Iniciar sessão' }).isVisible()) {
      await page.getByRole('button', { name: 'Iniciar sessão' }).click()
    }
    await expect(page.getByRole('heading', { name: 'Painel inicial' })).toBeVisible()

    // Rename a career in the panel…
    await page.goto('/admin/careers')
    await page.getByRole('searchbox', { name: 'Pesquisar', exact: true }).fill('actor')
    await page
      .getByRole('row')
      .filter({ has: page.getByText('actor', { exact: true }) })
      .getByRole('link', { name: 'Editar' })
      .click()
    await page.getByRole('tab', { name: 'Português' }).click()
    await page.getByRole('tabpanel').getByRole('textbox', { name: /^Nome/ }).fill('Actor de teatro e cinema')
    await page
      .getByRole('button', { name: /Guardar/ })
      .first()
      .click()
    await expect(page.getByText('Guardado')).toBeVisible()

    // …and the app shows it at once (saving cleared the API's cache).
    await page.goto('/carreiras/actor')
    // Saving cleared every cached answer: the first visit rebuilds them (slow on PHP's one-thread server).
    await expect(page.getByRole('heading', { level: 1, name: 'Actor de teatro e cinema' })).toBeVisible({
      timeout: 60_000,
    })
    expect(consoleErrors).toEqual([])
  })
})
