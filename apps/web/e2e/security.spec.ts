import { expect, test } from './fixtures'

test.describe('security end-to-end', () => {
  test('the app is served with a strict Content-Security-Policy', async ({ page }) => {
    const response = await page.goto('/')
    const headers = response?.headers() ?? {}

    expect(headers['content-security-policy']).toContain("script-src 'self';")
    expect(headers['content-security-policy']).not.toContain('unsafe-inline')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/)
  })

  test('the policy blocks injected inline scripts', async ({ page }) => {
    const violations: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') violations.push(message.text())
    })
    await page.goto('/')

    const ran = await page.evaluate(() => {
      const script = document.createElement('script')
      script.textContent = 'window.injectedByTest = true'
      document.body.append(script)
      return Boolean((window as unknown as { injectedByTest?: boolean }).injectedByTest)
    })

    expect(ran).toBe(false)
    expect(violations.join(' ')).toContain('Content Security Policy')
  })

  test('the admin panel asks for a login and has no errors', async ({ page, consoleErrors }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin\/login$/)
    await expect(page.getByRole('heading', { name: 'Iniciar sessão' })).toBeVisible()
    expect(consoleErrors).toEqual([])
  })

  test('API errors are JSON and leak nothing', async ({ request }) => {
    const response = await request.get('/api/v1/nao-existe', { headers: { Accept: 'application/json' } })

    expect(response.status()).toBe(404)
    expect(response.headers()['content-type']).toContain('application/json')
    expect(await response.text()).not.toMatch(/vendor|Stack trace|\.php/i)
  })
})
