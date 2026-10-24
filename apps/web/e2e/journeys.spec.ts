import type { Page } from '@playwright/test'
import { expect, expectAccessible, test } from './fixtures'

/** Fills the onboarding profile; the app then returns to where it was. */
async function createProfile(page: Page) {
  await page.getByRole('button', { name: 'Continuar com o Google' }).click()
  await page.getByLabel('Como te chamas?').fill('Joana')
  await page.getByLabel('Ano em que nasceste').selectOption(String(new Date().getFullYear() - 19))
  await page.getByLabel('Província').selectOption('Luanda')
  await page.getByLabel('Último nível que concluíste').selectOption('medio_tecnico')
  await page.getByLabel(/Aceito os termos/).check()
  await page.getByRole('button', { name: 'Continuar' }).click()
}

test.describe('journeys', () => {
  test('from no profile to the test result, a career and the fit', async ({ page, consoleErrors }) => {
    test.slow()
    await page.goto('/teste')
    await expect(page).toHaveURL(/\/entrar\?next=%2Fteste$/)
    await expectAccessible(page)
    await createProfile(page)

    await expect(page).toHaveURL(/\/teste$/)
    await page.getByRole('button', { name: 'Começar' }).click()
    // Questions alternate R, I, A, S, E, C: a strong Investigative side.
    for (let index = 0; index < 42; index++) {
      await expect(page.getByText(`Pergunta ${index + 1} de 42`)).toBeVisible()
      await page.getByRole('button', { name: index % 6 === 1 ? /Muito/ : /Pouco/ }).click()
    }
    await page.getByRole('button', { name: /Ver o resultado/ }).click()

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^O teu perfil: I/)
    await expectAccessible(page)

    // Only a few demo careers have a full page; Desenvolvedor Frontend is one of the five.
    await page
      .getByRole('link', { name: /^Desenvolvedor Frontend.*Combina com o teu lado Investigativo/ })
      .click()
    const fit = page.getByRole('region', { name: 'O meu encaixe' })
    await expect(fit.getByText(/^Combina (muito|em parte|pouco)$/)).toBeVisible()
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('marking skills updates the fit, inside an accessible dialog', async ({ page, consoleErrors }) => {
    await page.goto('/carreiras/desenvolvedor-frontend')
    const fit = page.getByRole('region', { name: 'O meu encaixe' })
    await expect(fit.getByText('Já tens 0 de 6 essenciais')).toBeVisible()

    await fit.getByRole('button', { name: 'Marcar o que sei' }).click()
    const dialog = page.getByRole('dialog', { name: 'O que já sabes?' })
    await dialog.getByRole('group', { name: 'JavaScript' }).getByRole('button', { name: 'Domino' }).click()
    await expectAccessible(page)
    await page.keyboard.press('Escape')

    await expect(dialog).toBeHidden()
    await expect(fit.getByText('Já tens 1 de 6 essenciais')).toBeVisible()
    expect(consoleErrors).toEqual([])
  })

  test('comparing courses side by side', async ({ page, consoleErrors }) => {
    await page.goto('/cursos?carreira=desenvolvedor-frontend')
    const buttons = page.getByRole('button', { name: 'Comparar' })
    await buttons.nth(0).click()
    await buttons.nth(1).click()
    await expect(page.getByText('2 cursos para comparar')).toBeVisible()
    await expectAccessible(page)

    await page.getByRole('link', { name: 'Comparar' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Comparar cursos')
    // Two courses, two column headers.
    await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(2)
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('a model CV becomes the start of the person’s own CV', async ({ page, consoleErrors }) => {
    await page.goto('/cv/modelos/frontend-primeiro-emprego')
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Começar a partir deste modelo' }).click()

    // The editor needs a profile: create it and come back.
    await expect(page).toHaveURL(/\/entrar\?next=%2Fcv%2Feditar$/)
    await createProfile(page)
    await expect(page).toHaveURL(/\/cv\/editar$/)
    await expect(page.getByText(/Dica do modelo/).first()).toBeVisible()

    await page.getByLabel('Título profissional').fill('Desenvolvedora Frontend')
    await page.reload()
    await expect(page.getByLabel('Título profissional')).toHaveValue('Desenvolvedora Frontend')
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('the person can erase everything the app keeps', async ({ page, consoleErrors }) => {
    await page.goto('/entrar')
    await createProfile(page)
    await page.goto('/perfil')
    await expect(page.getByText('Joana')).toBeVisible()

    await page.getByRole('button', { name: 'Apagar os meus dados' }).click()
    await page
      .getByRole('dialog', { name: 'Apagar tudo?' })
      .getByRole('button', { name: 'Sim, apagar' })
      .click()
    await expect(page.getByText('Ainda não tens perfil.')).toBeVisible()
    await page.reload()
    await expect(page.getByText('Ainda não tens perfil.')).toBeVisible()
    expect(consoleErrors).toEqual([])
  })
})
