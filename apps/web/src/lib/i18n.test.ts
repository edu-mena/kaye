import { describe, expect, it, vi } from 'vitest'
import { en } from '../locales/en'
import { fr } from '../locales/fr'
import { pt } from '../locales/pt'
import { changeLocale, i18n, LOCALES } from './i18n'

function keysOf(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

describe('i18n', () => {
  it('has the same keys and no empty text in every language', () => {
    const reference = keysOf(pt).toSorted()

    for (const messages of [en, fr]) {
      expect(keysOf(messages).toSorted()).toEqual(reference)
    }
    for (const messages of [pt, en, fr]) {
      expect(JSON.stringify(messages)).not.toContain('""')
    }
  })

  it('changes the language, the page lang and remembers the choice', () => {
    changeLocale('en')

    expect(i18n.language).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('kaye.locale')).toBe('en')
  })

  it('still changes the language when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })

    expect(() => changeLocale('fr')).not.toThrow()
    expect(i18n.language).toBe('fr')
  })

  it('supports exactly pt, en and fr', () => {
    expect(LOCALES).toEqual(['pt', 'en', 'fr'])
  })
})

/** Imports i18n again, as on a fresh page load, and returns the language it picked. */
async function loadFresh() {
  vi.resetModules()
  const module = await import('./i18n')
  return module.i18n.language
}

describe('initial language', () => {
  it('uses the saved choice first', async () => {
    localStorage.setItem('kaye.locale', 'fr')
    await expect(loadFresh()).resolves.toBe('fr')
  })

  it('falls back to the device language when it is supported', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB')
    await expect(loadFresh()).resolves.toBe('en')
  })

  it('falls back to Portuguese for any other device language', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')
    await expect(loadFresh()).resolves.toBe('pt')
  })

  it('ignores an invalid saved value', async () => {
    localStorage.setItem('kaye.locale', 'xx')
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pt-AO')
    await expect(loadFresh()).resolves.toBe('pt')
  })

  it('works when storage cannot be read', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR')
    await expect(loadFresh()).resolves.toBe('fr')
  })
})
