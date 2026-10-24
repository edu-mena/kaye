import { expect, expectAccessible, test } from './fixtures'

test.describe('app shell', () => {
  test('a first visit welcomes, explains the demo and is accessible', async ({ page, consoleErrors }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Olá! Este é o Kayé')
    await expect(page.getByText(/Demonstração: carreiras, cursos e números são exemplos/)).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link')).toHaveCount(
      5,
    )
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('tabs navigate without reloading the page', async ({ page, consoleErrors }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Cursos' }).click()

    await expect(page).toHaveURL(/\/cursos$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cursos')
    await expect(page.getByRole('link', { name: 'Cursos' })).toHaveAttribute('aria-current', 'page')
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
    await page.goto('/perfil')
    await expect(page.getByText('Ligado ao servidor')).toBeVisible()
    await page.getByRole('button', { name: 'Français' }).click()

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Profil')
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Profil')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('a phone set to English gets the app in English', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' })
    const page = await context.newPage()
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hi! This is Kayé')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await context.close()
  })

  test('unknown pages go back to home', async ({ page }) => {
    await page.goto('/nao-existe')

    await expect(page).toHaveURL(/\/$/)
  })
})
