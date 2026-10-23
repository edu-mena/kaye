import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { i18n } from '../lib/i18n'
import { reloadUser } from '../state/userStore'

// jsdom has no modal <dialog> nor scrolling: minimal stand-ins with the same contract.
function showModal(this: HTMLDialogElement) {
  this.open = true
}
function close(this: HTMLDialogElement) {
  this.open = false
  this.dispatchEvent(new Event('close'))
}
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = showModal
  HTMLDialogElement.prototype.close = close
}
window.scrollTo = () => {}

// jsdom reports an en-US device; every test starts in Portuguese, with no saved data.
beforeEach(async () => {
  localStorage.clear()
  reloadUser()
  await i18n.changeLanguage('pt')
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
