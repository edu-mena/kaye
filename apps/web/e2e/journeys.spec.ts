import { expect, expectAccessible, test } from './fixtures'

test.describe('the first visit', () => {
  test.use({ signedIn: false })

  test('a short conversation ends in the plan and goes back to what was asked', async ({
    page,
    consoleErrors,
  }) => {
    test.slow()
    const proceed = () => page.getByRole('button', { name: 'Continuar', exact: true }).click()

    // The waiting list still lives in the Vercel functions (apps/web/api); Laravel gets it in prompt 5 of
    // the backend plan. Until then, answered here as those functions answer.
    let signups = 0
    await page.route('**/api/v1/waitlist', (route) => {
      signups++
      return route.fulfill({ json: { ok: true } })
    })

    // Without an account, the landing page; its call to action opens the conversation.
    await page.goto('/teste')
    await expect(page).toHaveURL(/\/\?next=%2Fteste$/)
    await page.getByRole('link', { name: 'Entrar e ver' }).click()
    await expect(page).toHaveURL(/\/entrar\?next=%2Fteste$/)
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Vamos lá' }).click()

    // The launch contact comes first.
    await page.getByLabel('Email').fill('joana@exemplo.ao')
    await page.getByLabel(/Aceito que o Kayé guarde este contacto/).check()
    await expectAccessible(page)
    await proceed()

    await expect(page.getByRole('heading', { name: 'Como queres que eu soe?' })).toBeVisible()
    expect(signups).toBe(1)
    await proceed()
    await page.getByRole('button', { name: 'Procuro trabalho' }).click()
    await proceed()
    await page.getByRole('button', { name: 'Escolher um curso' }).click()
    await proceed()
    await proceed()
    await page.getByRole('button', { name: /^Saúde/ }).click()
    await expectAccessible(page)
    await proceed()
    await page.getByRole('group').getByRole('button').first().click()
    await proceed()
    await page.getByRole('button', { name: 'Estudo isto' }).click()
    await proceed()
    await page.getByRole('button', { name: 'Sim', exact: true }).click()

    await page.getByLabel('Como te chamas?').fill('Joana')
    await proceed()
    await page.getByLabel('Ano em que nasceste').selectOption(String(new Date().getFullYear() - 19))
    await page.getByLabel('Província').selectOption('Luanda')
    await proceed()
    await page.getByRole('button', { name: 'Licenciatura' }).click()
    await proceed()

    await page.getByLabel(/Aceito os termos/).check()
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Continuar com o Google' }).click()
    await expect(page.getByRole('heading', { name: 'O teu plano, Joana' })).toBeVisible()
    await expectAccessible(page)
    await page.getByRole('link', { name: /Entrar no Kayé/ }).click()
    await expect(page).toHaveURL(/\/teste$/)
    expect(consoleErrors).toEqual([])
  })
})

test.describe('journeys', () => {
  test('from the test to the result, a career and the fit', async ({ page, consoleErrors }) => {
    test.slow()
    await page.goto('/teste')
    await page.getByRole('button', { name: 'Começar' }).click()
    // Questions alternate R, I, A, S, E, C: strong Investigative and Artistic sides, where Frontend fits
    // (the health careers, high on Investigative, also need a strong Social side).
    for (let index = 0; index < 42; index++) {
      await expect(page.getByText(`Pergunta ${index + 1} de 42`)).toBeVisible()
      await page.getByRole('button', { name: index % 6 === 1 || index % 6 === 2 ? /Muito/ : /Pouco/ }).click()
    }
    await page.getByRole('button', { name: /Ver o resultado/ }).click()

    // Part 2, the strengths, comes next; the interests' result is already there.
    await expect(page).toHaveURL(/\/teste\/valencias$/)
    await expectAccessible(page)
    await page.goto('/teste/resultado')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^O teu perfil: I/)
    await expectAccessible(page)

    await page
      .getByRole('link', { name: /Combina com o teu lado/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/carreiras\//)
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

  // "Comparar" (the Programa-based ranking and its compare tray) has no data to show while
  // the fictional demo programs catalogue (data/demo/programs.ts) is empty; coverage for it
  // returns once that ranking has real courses behind it again.

  test('a model CV becomes the start of the person’s own CV', async ({ page, consoleErrors }) => {
    await page.goto('/cv/modelos/frontend-primeiro-emprego')
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Começar a partir deste modelo' }).click()

    await expect(page).toHaveURL(/\/cv\/editar$/)
    await expect(page.getByText(/Dica do modelo/).first()).toBeVisible()

    await page.getByLabel('Título profissional').fill('Desenvolvedora Frontend')
    await page.reload()
    await expect(page.getByLabel('Título profissional')).toHaveValue('Desenvolvedora Frontend')
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('the person can erase everything the app keeps', async ({ page, consoleErrors }) => {
    await page.goto('/perfil')
    await expect(page.getByText('Joana')).toBeVisible()
    await expectAccessible(page)

    await page.getByRole('tab', { name: 'Privacidade' }).click()
    await page.getByRole('button', { name: 'Apagar os meus dados' }).click()
    await page
      .getByRole('dialog', { name: 'Apagar tudo?' })
      .getByRole('button', { name: 'Sim, apagar' })
      .click()
    // Nothing is left: the person is back on the landing page, also after a reload.
    const landing = page.getByRole('heading', {
      level: 1,
      name: 'Todo o jovem merece saber o próximo passo.',
    })
    await expect(landing).toBeVisible()
    await page.reload()
    await expect(landing).toBeVisible()
    expect(consoleErrors).toEqual([])
  })

  test('settings lead to the privacy policy and the terms', async ({ page, consoleErrors }) => {
    await page.goto('/configuracoes')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Configurações')
    await expectAccessible(page)

    await page.getByRole('link', { name: 'Política de privacidade' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de privacidade')
    await page
      .getByRole('navigation', { name: 'Nesta página' })
      .getByRole('link', { name: /Os teus direitos/ })
      .click()
    await expect(page).toHaveURL(/\/privacidade#direitos$/)
    await expect(page.getByRole('heading', { name: '7. Os teus direitos' })).toBeInViewport()
    await expectAccessible(page)

    await page.getByRole('link', { name: 'Termos de uso' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Termos de uso')
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })

  test('searching from the bottom bar, opening a result and coming back', async ({ page, consoleErrors }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Pesquisa' })
      .click()
    const field = page.getByRole('searchbox', { name: 'Pesquisar no Kayé' })
    await expect(field).toBeFocused()
    await expectAccessible(page)

    await page.keyboard.type('dados')
    await expect(page.getByText('12 resultados para «dados»')).toBeVisible()
    await expectAccessible(page)
    await page.getByRole('link', { name: /Analista de Dados/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Analista de Dados')

    await page.goBack()
    await expect(field).toHaveValue('dados')
    await field.fill('')
    await expect(
      page.getByRole('region', { name: 'Pesquisas recentes' }).getByRole('button', { name: 'dados' }),
    ).toBeVisible()
    expect(consoleErrors).toEqual([])
  })

  test('the market and the news, from the menu, lead to their pages', async ({ page, consoleErrors }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu' }).click()
    await page.getByRole('navigation', { name: 'Mais opções' }).getByRole('link', { name: 'Mercado' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mercado')
    await expect(page.getByRole('tab', { name: 'Resumo', selected: true })).toBeVisible()
    await expectAccessible(page)

    // Nothing wider than the phone: below lg, the areas are cards instead of the table.
    await page.getByRole('tab', { name: 'Por área' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Por área' })).toBeAttached()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    )
    await expectAccessible(page)

    await page.getByRole('tab', { name: 'Vagas' }).click()
    await expect(page.getByRole('region', { name: 'Vagas por área' })).toBeVisible()
    await page
      .getByRole('region', { name: /^Mais procuradas em tecnologia/ })
      .getByRole('link', { name: /^(?!Ver todas)/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/carreiras\//)

    await page.goto('/novidades')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Novidades')
    await expectAccessible(page)
    await page.getByRole('button', { name: /^Empresas/ }).click()
    await expect(page).toHaveURL(/tipo=empresas/)
    // A piece opens on its own page, with its source.
    await page.getByRole('article').first().getByRole('link').first().click()
    await expect(page).toHaveURL(/\/novidades\/[a-z0-9-]+$/)
    await expect(page.getByRole('link', { name: /^Fonte:/ })).toBeVisible()
    await expectAccessible(page)
    expect(consoleErrors).toEqual([])
  })
})
