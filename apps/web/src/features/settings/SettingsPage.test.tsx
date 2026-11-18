import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getUser } from '../../state/userStore'
import { mockFetchJson, renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import SettingsPage from './SettingsPage'

describe('SettingsPage', () => {
  it('gathers the language, the data, the notifications and the service status', async () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<SettingsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Configurações' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Idioma' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Os teus dados' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notificações' })).toBeInTheDocument()
    // The notices need an account: without one the group says so (features/settings/NoticePreferences.test.tsx).
    expect(screen.getByText(/Entra com a tua conta para receberes avisos/)).toBeInTheDocument()
    expect(await screen.findByText('Ligado ao servidor')).toBeInTheDocument()
  })

  it('changes the language', async () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<SettingsPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Français' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Paramètres' })).toBeInTheDocument()
  })

  it('leads to the terms of use and the privacy policy', async () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<SettingsPage />)

    expect(screen.getByRole('link', { name: 'Termos de uso' })).toHaveAttribute('href', '/termos')
    await userEvent.click(screen.getByRole('link', { name: 'Política de privacidade' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/privacidade')
  })

  it('erases only after confirming, and says it is done', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    renderWithApp(<SettingsPage />)
    const status = within(screen.getByRole('region', { name: 'Os teus dados' })).getByRole('status')
    expect(status).toBeEmptyDOMElement()

    await userEvent.click(screen.getByRole('button', { name: 'Apagar os meus dados' }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Apagar tudo?' })).getByRole('button', { name: 'Cancelar' }),
    )
    expect(getUser().profile).not.toBeNull()
    expect(status).toBeEmptyDOMElement()

    await userEvent.click(screen.getByRole('button', { name: 'Apagar os meus dados' }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Apagar tudo?' })).getByRole('button', {
        name: 'Sim, apagar',
      }),
    )
    expect(getUser().profile).toBeNull()
    expect(status).toHaveTextContent('Pronto: apagámos tudo o que o Kayé guardava neste aparelho.')
  })
})
