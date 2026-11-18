import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../test/render'
import { NoticePreferences } from './NoticePreferences'

// "Avisos" in the settings: each switch is a consent on the server; the browser's permission comes only after
// a tap on a push switch, and the push switches exist only where Web Push works (lib/webPush.test.ts).

const mocks = vi.hoisted(() => ({
  account: { status: 'signedIn', me: null } as { status: string; me: unknown },
  giveConsent: vi.fn<(kind: string, version: string) => Promise<unknown>>(),
  revokeConsent: vi.fn<(kind: string) => Promise<void>>(),
  getPushKey: vi.fn<() => Promise<string | null>>(),
  pushSupported: vi.fn<() => boolean>(),
  subscribePush: vi.fn<(key: string) => Promise<'granted' | 'denied'>>(),
  unsubscribePush: vi.fn<() => Promise<void>>(),
}))

vi.mock('../../state/accountSync', () => ({ useAccount: () => mocks.account }))
vi.mock('../../data/account', () => ({
  giveConsent: mocks.giveConsent,
  revokeConsent: mocks.revokeConsent,
  getPushKey: mocks.getPushKey,
}))
vi.mock('../../lib/webPush', () => ({
  pushSupported: mocks.pushSupported,
  subscribePush: mocks.subscribePush,
  unsubscribePush: mocks.unsubscribePush,
}))

function signIn({ minor = false, consents = [] as string[] } = {}) {
  mocks.account = { status: 'signedIn', me: { id: 7, email: 'ana@example.com', minor, consents } }
}

const toggle = (name: string) => screen.getByRole('switch', { name })

describe('NoticePreferences', () => {
  beforeEach(() => {
    signIn()
    mocks.giveConsent.mockReset().mockResolvedValue({})
    mocks.revokeConsent.mockReset().mockResolvedValue()
    mocks.getPushKey.mockReset().mockResolvedValue('BPublicKey')
    mocks.pushSupported.mockReset().mockReturnValue(false)
    mocks.subscribePush.mockReset().mockResolvedValue('granted')
    mocks.unsubscribePush.mockReset().mockResolvedValue()
  })

  it('without a session asks to sign in, with no switches', () => {
    mocks.account = { status: 'signedOut', me: null }
    renderWithApp(<NoticePreferences />)

    expect(screen.getByText(/Entra com a tua conta/)).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('shows the consents the account has, and turning one on gives it with the texts version', async () => {
    signIn({ consents: ['terms', 'email_service'] })
    renderWithApp(<NoticePreferences />)

    expect(toggle('Prazos que guardaste, por email')).toHaveAttribute('aria-checked', 'true')
    expect(toggle('Novidades da semana, por email')).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(toggle('Novidades da semana, por email'))

    expect(mocks.giveConsent).toHaveBeenCalledWith('email_marketing', '2026-11-12')
    expect(toggle('Novidades da semana, por email')).toHaveAttribute('aria-checked', 'true')
  })

  it('turning one off withdraws it', async () => {
    signIn({ consents: ['email_service'] })
    renderWithApp(<NoticePreferences />)

    await userEvent.click(toggle('Prazos que guardaste, por email'))

    expect(mocks.revokeConsent).toHaveBeenCalledWith('email_service')
    expect(toggle('Prazos que guardaste, por email')).toHaveAttribute('aria-checked', 'false')
  })

  it('hides the news from a minor', () => {
    signIn({ minor: true })
    renderWithApp(<NoticePreferences />)

    expect(screen.getAllByRole('switch')).toHaveLength(1)
    expect(screen.queryByRole('switch', { name: /Novidades/ })).not.toBeInTheDocument()
    expect(screen.getByText(/maiores de 18 anos/)).toBeInTheDocument()
  })

  it('without Web Push (the Android app, iOS outside the app) there is no push switch', () => {
    renderWithApp(<NoticePreferences />)

    expect(screen.queryByRole('switch', { name: /no browser/ })).not.toBeInTheDocument()
    expect(mocks.getPushKey).not.toHaveBeenCalled()
  })

  it('without a key on the server there is no push switch either', async () => {
    mocks.pushSupported.mockReturnValue(true)
    mocks.getPushKey.mockResolvedValue(null)
    renderWithApp(<NoticePreferences />)

    await vi.waitFor(() => expect(mocks.getPushKey).toHaveBeenCalled())
    expect(screen.queryByRole('switch', { name: /no browser/ })).not.toBeInTheDocument()
  })

  it('asks the browser only after the tap, then subscribes with the key', async () => {
    mocks.pushSupported.mockReturnValue(true)
    renderWithApp(<NoticePreferences />)

    const push = await screen.findByRole('switch', { name: 'Prazos que guardaste, no browser' })
    expect(mocks.subscribePush).not.toHaveBeenCalled()
    await userEvent.click(push)

    expect(mocks.giveConsent).toHaveBeenCalledWith('push_service', '2026-11-12')
    expect(mocks.subscribePush).toHaveBeenCalledWith('BPublicKey')
    expect(push).toHaveAttribute('aria-checked', 'true')
  })

  it('a second push switch does not ask again', async () => {
    mocks.pushSupported.mockReturnValue(true)
    signIn({ consents: ['push_service'] })
    renderWithApp(<NoticePreferences />)

    await userEvent.click(await screen.findByRole('switch', { name: 'Novidades da semana, no browser' }))

    expect(mocks.giveConsent).toHaveBeenCalledWith('push_marketing', '2026-11-12')
    expect(mocks.subscribePush).not.toHaveBeenCalled()
  })

  it('when the browser says no, withdraws the consent and says how to allow it', async () => {
    mocks.pushSupported.mockReturnValue(true)
    mocks.subscribePush.mockResolvedValue('denied')
    renderWithApp(<NoticePreferences />)

    const push = await screen.findByRole('switch', { name: 'Prazos que guardaste, no browser' })
    await userEvent.click(push)

    expect(mocks.revokeConsent).toHaveBeenCalledWith('push_service')
    expect(push).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('alert')).toHaveTextContent('O browser bloqueou as notificações')
  })

  it('when subscribing fails, withdraws the consent and says to try again', async () => {
    mocks.pushSupported.mockReturnValue(true)
    mocks.subscribePush.mockRejectedValue(new Error('No service worker'))
    renderWithApp(<NoticePreferences />)

    await userEvent.click(await screen.findByRole('switch', { name: 'Prazos que guardaste, no browser' }))

    expect(mocks.revokeConsent).toHaveBeenCalledWith('push_service')
    expect(screen.getByRole('alert')).toHaveTextContent('Não conseguimos guardar agora')
  })

  it('turning off the last push switch ends the browser subscription', async () => {
    mocks.pushSupported.mockReturnValue(true)
    signIn({ consents: ['push_service', 'push_marketing'] })
    renderWithApp(<NoticePreferences />)

    await userEvent.click(await screen.findByRole('switch', { name: 'Novidades da semana, no browser' }))
    expect(mocks.unsubscribePush).not.toHaveBeenCalled()
    await userEvent.click(toggle('Prazos que guardaste, no browser'))

    expect(mocks.unsubscribePush).toHaveBeenCalledOnce()
  })

  it('when the server fails, keeps the switch as it was and says so', async () => {
    mocks.giveConsent.mockRejectedValue(new TypeError('Failed to fetch'))
    renderWithApp(<NoticePreferences />)

    await userEvent.click(toggle('Prazos que guardaste, por email'))

    expect(toggle('Prazos que guardaste, por email')).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('alert')).toHaveTextContent('Não conseguimos guardar agora')
  })
})
