import { AxeBuilder } from '@axe-core/playwright'
import { test as base, expect, type Page } from '@playwright/test'

type Fixtures = {
  /** Fails the test if the page logs any error (CSP violations included). */
  consoleErrors: string[]
}

export const test = base.extend<Fixtures>({
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
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')

  expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([])
}
