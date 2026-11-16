import { AxeBuilder } from '@axe-core/playwright'
import { test as base, expect, type Page } from '@playwright/test'

type Fixtures = {
  /** Fails the test if the page logs any error (CSP violations included). */
  consoleErrors: string[]
  /** The app asks for an account: tests start with one, unless they turn this off. */
  signedIn: boolean
  /**
   * A first visit with an account starts the guided tour, which takes the person to its pages. Tests are
   * returning users (tour done), unless they turn this off to test the tour itself.
   */
  tourDone: boolean
}

const PROFILE = {
  version: 1,
  profile: {
    name: 'Joana',
    birthYear: 2006,
    province: 'Luanda',
    education: 'medio_tecnico',
    guardianInformed: false,
  },
}

export const test = base.extend<Fixtures>({
  signedIn: [true, { option: true }],
  tourDone: [true, { option: true }],
  page: async ({ page, signedIn, tourDone }, provide) => {
    if (signedIn) {
      // Only once per tab, so erasing the data is not undone by the next page load.
      await page.addInitScript(
        ({ user, tour }) => {
          if (sessionStorage.getItem('e2e.seeded')) return
          sessionStorage.setItem('e2e.seeded', '1')
          localStorage.setItem('kaye.user.v1', user)
          if (tour) localStorage.setItem('kaye.tour.done', '1')
        },
        { user: JSON.stringify(PROFILE), tour: tourDone },
      )
    }
    await provide(page)
  },
  consoleErrors: async ({ page }, provide) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await provide(errors)

    expect(errors, 'the page logged errors').toEqual([])
  },
})

export { expect }

/** No serious or critical accessibility problems (WCAG 2.1 AA). */
export async function expectAccessible(page: Page) {
  // Measure the settled page: text mid-entrance is still fading in, so its contrast
  // is not the real one. Endless animations (the "Estás aqui" pulse) are ignored.
  // Scroll-driven animations (the landing's reveals) follow the scroll, not the clock: they never end.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .filter((animation) => animation.timeline instanceof DocumentTimeline)
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .every((animation) => animation.playState !== 'running'),
  )
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')

  // Name the elements too, so a failure says exactly what to fix.
  const report = serious.flatMap((violation) =>
    violation.nodes.map(
      (node) => `${violation.id} at ${node.target.join(' ')}: ${node.failureSummary ?? ''}`,
    ),
  )
  expect(report, `accessibility problems on ${page.url()}`).toEqual([])
}
