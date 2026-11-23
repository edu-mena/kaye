import { expect, expectAccessible, test } from './fixtures'

test.describe('the first visit', () => {
  test.use({ signedIn: false })

  test('a short conversation ends in the plan and goes back to what was asked', async ({
    page,
    consoleErrors,
  }) => {
    test.slow()
    const proceed = () => page.getByRole('button', { name: 'Continuar', exact: true }).click()

    // A shared link to the test, opened by someone without an account: the conversation, then straight back.
    await page.goto('/entrar?next=%2Fteste')
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Vamos lá' }).click()

    // The launch contact comes first.
    await page.getByLabel('Email').fill('joana@exemplo.ao')
    await page.getByLabel(/Aceito que o Kayé guarde este contacto/).check()
    await expectAccessible(page)
    // The contact goes to Laravel's waiting list (201, or 200 when this email is there from an earlier run).
    const signup = page.waitForResponse(
      (response) => response.url().endsWith('/api/v1/waitlist') && response.request().method() === 'POST',
    )
    await proceed()

    await expect(page.getByRole('heading', { name: 'Como queres que eu soe?' })).toBeVisible()
    expect((await signup).ok()).toBe(true)
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

    // Google cannot sign in a test: its page answers as Google does (back to `next` with a session),
    // and the account routes answer as Laravel does for that session (AndroidLoginTest, WebLoginTest
    // and UserDataTest test the real ones). On the context, which also sees the service worker's requests.
    const sent: { path: string; body: unknown }[] = []
    await page.context().route(/\/auth\/google\/redirect\?/, (route) =>
      route.fulfill({
        status: 302,
        headers: { location: new URL(route.request().url()).searchParams.get('next') ?? '/' },
      }),
    )
    await page.context().route(/\/api\/v1\/me(\/|$)/, (route) => {
      const path = new URL(route.request().url()).pathname.replace('/api/v1', '')
      const body: unknown = route.request().postDataJSON()
      sent.push({ path, body })
      if (path === '/me') return route.fulfill({ json: { id: 1, email: 'joana@exemplo.ao', consents: [] } })
      if (path === '/me/data/merge') return route.fulfill({ json: { version: 1, ...(body as object) } })
      return route.fulfill({ status: 201, json: {} })
    })

    await page.getByLabel(/Aceito os termos/).check()
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Continuar com o Google' }).click()
    await expect(page).toHaveURL(/\/entrar\?plano=1&next=%2Fteste$/)
    await expect(page.getByRole('heading', { name: 'O teu plano, Joana' })).toBeVisible()
    // Back from Google, what the device has joins the account, and the accepted texts are recorded.
    await expect.poll(() => sent.map((call) => call.path)).toContain('/me/consents')
    const merge = sent.find((call) => call.path === '/me/data/merge')?.body as { data: { profile: unknown } }
    expect(merge.data.profile).toMatchObject({ name: 'Joana', province: 'Luanda' })
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
    // Statements alternate R, I, A, S, E, C; strong Investigative and Artistic sides, where Frontend fits (the
    // health careers, high on Investigative, also need a strong Social side). In every situation the card of
    // the Investigative interest is picked: card k of situation n belongs to interest (k + n) mod 6.
    let statements = 0
    let situations = 0
    for (let index = 0; index < 42; index++) {
      await expect(page.getByText(`Pergunta ${index + 1} de 42`)).toBeVisible()
      if (await page.getByText('Quanto gostas de…').isVisible()) {
        const strong = statements % 6 === 1 || statements % 6 === 2
        await page.getByRole('button', { name: strong ? /Muito/ : /Pouco/ }).click()
        statements++
      } else {
        await page
          .locator('fieldset button')
          .nth((((1 - situations) % 6) + 6) % 6)
          .click()
        situations++
      }
    }
    expect([statements, situations]).toEqual([30, 12])
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
    // The notices are consents on the account: without a session the group says so, with no switches.
    await expect(
      page.getByText('Entra com a tua conta para receberes avisos por email ou no browser.'),
    ).toBeVisible()
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

test.describe('the links in the emails', () => {
  test.use({ signedIn: false })

  test('a link that was changed opens the server page, styled under the CSP', async ({ page }) => {
    const csp: string[] = []
    page.on('console', (message) => {
      if (message.text().includes('Content Security Policy')) csp.push(message.text())
    })

    // No signature: refused before anything else (docs/seguranca.md, "Avisos").
    const response = await page.goto('/unsubscribe/user-1?kind=email_marketing')

    expect(response?.status()).toBe(403)
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Este link não é válido')
    // public/notices.css loaded: the page has the site's paper colour, not the browser's white.
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 244, 238)')
    await expectAccessible(page)
    expect(csp).toEqual([])
  })
})
