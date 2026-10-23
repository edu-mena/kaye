import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { i18n } from '../lib/i18n'

// jsdom reports an en-US device; every test starts in Portuguese, without a saved choice.
beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage('pt')
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
