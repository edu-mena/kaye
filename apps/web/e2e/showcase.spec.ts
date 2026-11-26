import { expect, test } from './fixtures'

// The pages shown in a presentation, opened by a person with no account. Read-only: nothing here writes, so the
// same file runs against production (`E2E_BASE_URL=https://kayeangola.com npx playwright test showcase`) and in CI.

test.describe('the showcase pages, with no account', () => {
  test.use({ signedIn: false })
  // A live site can answer slowly (the first answers after a deploy): wait longer than the 30 s default.
  test.setTimeout(90_000)

  // The companies and academies docs/apresentacao.md says are safe to open: complete page, photos, official site.
  const COMPANIES = [
    'unitel',
    'banco-sol',
    'bai',
    'banco-de-poupanca-e-credito-bpc',
    'sociedade-mineira-de-catoca',
  ]
  const ACADEMIES = [
    'isptec',
    'universidades-jean-piaget',
    'universidade-de-belas',
    'universidade-de-luanda',
    'itel',
  ]

  const PAGES: Array<{ name: string; path: string }> = [
    { name: 'the home', path: '/' },
    { name: 'the careers', path: '/carreiras' },
    { name: 'a career', path: '/carreiras/analista-de-ciberseguranca' },
    { name: 'the companies', path: '/empresas' },
    { name: 'the academies', path: '/academias' },
    { name: 'the news', path: '/novidades' },
    { name: 'the market and its rankings', path: '/mercado' },
    { name: 'the job simulations', path: '/simulacoes' },
    { name: 'a job simulation', path: '/simulacoes/um-dia-como-enfermeiro' },
    { name: 'the CV', path: '/cv' },
    { name: 'the test', path: '/teste' },
    { name: 'the sign-in page', path: '/entrar' },
    ...COMPANIES.map((id) => ({ name: `the company ${id}`, path: `/empresas/${id}` })),
    ...ACADEMIES.map((id) => ({ name: `the academy ${id}`, path: `/academias/${id}` })),
  ]

  for (const { name, path } of PAGES) {
    test(`${name} opens with no errors, no CSP violation and no failed request`, async ({
      page,
      consoleErrors,
    }) => {
      const failed: string[] = []
      page.on('response', (response) => {
        if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
      })

      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 30_000 })
      await page.waitForLoadState('networkidle')

      expect(failed, 'requests that failed').toEqual([])
      expect(consoleErrors).toEqual([])
    })
  }

  test('a news item opens from the list', async ({ page, consoleErrors }) => {
    await page.goto('/novidades')
    await page.locator('a[href^="/novidades/"]').first().click()
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 30_000 })
    expect(consoleErrors).toEqual([])
  })

  test('commenting asks for the account: the server refuses a comment with no session', async ({
    request,
  }) => {
    const response = await request.post('/api/v1/comments', {
      headers: { Accept: 'application/json' },
      data: {},
    })
    expect(response.status()).toBe(401)
  })

  test('the Google sign-in leaves for Google with the return address of this site', async ({
    request,
    baseURL,
  }) => {
    // Only where the site has its real address and Google keys (production): the CI stack has neither.
    test.skip(!baseURL?.startsWith('https://'), 'needs the real address and the Google keys')
    const response = await request.get('/auth/google/redirect', { maxRedirects: 0 })
    expect(response.status()).toBe(302)
    const location = new URL(response.headers().location ?? '')
    expect(location.host).toBe('accounts.google.com')
    expect(location.searchParams.get('redirect_uri')).toBe(`${baseURL}/auth/google/callback`)
  })
})
