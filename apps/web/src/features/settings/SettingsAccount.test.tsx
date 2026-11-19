import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { mockFetchJson, renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import SettingsPage from './SettingsPage'

// The settings with an account (state/accountSync.ts has its own tests): who is signed in, signing out,
// the server's export, and an erase that deletes the account first.

const account = vi.hoisted(() => ({
  state: { status: 'signedIn', me: { id: 7, email: 'joana@example.com' } } as {
    status: string
    me: { id: number; email: string } | null
  },
  eraseEverything: vi.fn<() => Promise<void>>(),
  signOut: vi.fn<() => Promise<void>>(),
}))

vi.mock('../../state/accountSync', () => ({
  useAccount: () => account.state,
  eraseEverything: account.eraseEverything,
  signOut: account.signOut,
}))

const dataSection = () => screen.getByRole('region', { name: 'Os teus dados' })

async function confirmErase() {
  await userEvent.click(screen.getByRole('button', { name: 'Apagar os meus dados' }))
  const dialog = screen.getByRole('dialog', { name: 'Apagar tudo?' })
  await userEvent.click(within(dialog).getByRole('button', { name: 'Sim, apagar' }))
  return dialog
}

describe('SettingsPage with an account', () => {
  beforeEach(() => {
    account.state = { status: 'signedIn', me: { id: 7, email: 'joana@example.com' } }
    account.eraseEverything.mockReset().mockResolvedValue()
    account.signOut.mockReset().mockResolvedValue()
    mockFetchJson({ status: 'ok' })
    seedUser()
  })

  it('shows who is signed in and signs out', async () => {
    renderWithApp(<SettingsPage />)

    expect(within(dataSection()).getByText('joana@example.com')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Terminar sessão' }))

    expect(account.signOut).toHaveBeenCalledOnce()
  })

  it('says the account goes too, and says it is done', async () => {
    renderWithApp(<SettingsPage />)

    const dialog = await confirmErase()

    expect(within(dialog).getByText(/A tua conta e tudo o que o Kayé guarda sobre ti/)).toBeInTheDocument()
    expect(account.eraseEverything).toHaveBeenCalledOnce()
    expect(await within(dataSection()).findByRole('status')).toHaveTextContent('Pronto')
  })

  it('when the account cannot be deleted, says so and erases nothing', async () => {
    account.eraseEverything.mockRejectedValue(new TypeError('Failed to fetch'))
    renderWithApp(<SettingsPage />)

    const dialog = await confirmErase()

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Não conseguimos apagar a conta agora')
    expect(getUser().profile).not.toBeNull()
    expect(within(dataSection()).getByRole('status')).toBeEmptyDOMElement()
  })

  it('downloads the export from the server', async () => {
    const assign = vi.fn<(url: string) => void>()
    vi.stubGlobal('location', { ...window.location, assign })
    renderWithApp(<SettingsPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Descarregar os meus dados' }))

    expect(assign).toHaveBeenCalledWith('/api/v1/me/export')
  })

  it('without a session there is no account row', () => {
    account.state = { status: 'signedOut', me: null }
    renderWithApp(<SettingsPage />)

    expect(screen.queryByRole('button', { name: 'Terminar sessão' })).not.toBeInTheDocument()
  })
})
