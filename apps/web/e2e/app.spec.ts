import { expect, expectAccessible, test } from './fixtures'

test.describe('without an account', () => {
  test.use({ signedIn: false })

  test('a first visit welcomes and is accessible', async ({ page, consoleErrors }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Todo o jovem merece saber o próximo passo.',
    )
    await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toHaveCount(0)
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('the catalogue asks for an account first', async ({ page }) => {
    await page.goto('/cursos')
    await expect(page).toHaveURL(/\/entrar\?next=%2Fcursos$/)
  })

  test('the terms and the policy stay open to everyone', async ({ page }) => {
    await page.goto('/privacidade')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de privacidade')
  })
})

test.describe('app shell', () => {
  test('tabs navigate without reloading the page', async ({ page, consoleErrors }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Navegação principal' })
    await nav.getByRole('link', { name: 'Cursos' }).click()

    await expect(page).toHaveURL(/\/cursos$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cursos')
    await expect(nav.getByRole('link', { name: 'Cursos' })).toHaveAttribute('aria-current', 'page')
    expect(consoleErrors).toEqual([])
  })

  test('deep links open directly (server fallback)', async ({ page, consoleErrors }) => {
    await page.goto('/carreiras/analista-de-dados')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Analista de Dados')
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('the chosen language survives a reload, and the app reaches the API', async ({
    page,
    consoleErrors,
  }) => {
    await page.goto('/configuracoes')
    await expect(page.getByText('Ligado ao servidor')).toBeVisible()
    await page.getByRole('button', { name: 'Français' }).click()

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('a phone set to English gets the app in English', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' })
    const page = await context.newPage()
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to Kayé')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await context.close()
  })

  test('unknown pages go back to home', async ({ page }) => {
    await page.goto('/nao-existe')

    await expect(page).toHaveURL(/\/$/)
  })
})
