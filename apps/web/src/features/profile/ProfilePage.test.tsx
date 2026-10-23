import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { mockFetchJson, renderWithApp } from '../../test/render'
import { seedTested, seedUser } from '../../test/user'
import ProfilePage from './ProfilePage'

describe('ProfilePage', () => {
  it('invites people without a profile to create one', () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<ProfilePage />)
    expect(screen.getByText('Ainda não tens perfil.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Criar perfil' })).toHaveAttribute('href', '/entrar')
  })

  it('shows the person, the test code, skills and saved careers', async () => {
    mockFetchJson({ status: 'ok' })
    seedTested({ skills: { react: 'sei' }, savedCareers: ['designer-ui-ux'] })
    renderWithApp(<ProfilePage />)
    expect(screen.getByText('Joana')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'IAC' })).toHaveAttribute('href', '/teste/resultado')
    expect(screen.getByText('1 competência marcada')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /Designer UI\/UX/ })).toBeInTheDocument()
  })

  it('marks minors as a private profile', () => {
    mockFetchJson({ status: 'ok' })
    seedUser({
      profile: {
        name: 'Ana',
        birthYear: new Date().getFullYear() - 15,
        province: 'Bié',
        education: 'i_ciclo',
        guardianInformed: true,
      },
    })
    renderWithApp(<ProfilePage />)
    expect(screen.getByText('Perfil privado')).toBeInTheDocument()
  })

  it('shows earned and locked achievements with the XP total', () => {
    mockFetchJson({ status: 'ok' })
    seedTested()
    renderWithApp(<ProfilePage />)
    const achievements = screen.getByRole('region', { name: 'Conquistas' })
    expect(within(achievements).getByText('250 XP')).toBeInTheDocument()
    expect(within(achievements).getByText(/vale pontos \(XP\).*nunca te comparam/)).toBeInTheDocument()
    expect(within(achievements).getByText('Autoconhecimento')).toBeInTheDocument()
    expect(within(achievements).getAllByText('Por conquistar')).toHaveLength(4)
  })

  it('switches the language', async () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<ProfilePage />)
    await userEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('downloads a copy of everything the app keeps', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:kaye')
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn<(url: string) => void>() }),
    )
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderWithApp(<ProfilePage />)

    await userEvent.click(screen.getByRole('button', { name: 'Descarregar os meus dados' }))
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('erases the data only after confirming', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    renderWithApp(<ProfilePage />)
    await userEvent.click(screen.getByRole('button', { name: 'Apagar os meus dados' }))
    const dialog = screen.getByRole('dialog', { name: 'Apagar tudo?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(getUser().profile).not.toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Apagar os meus dados' }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Apagar tudo?' })).getByRole('button', {
        name: 'Sim, apagar',
      }),
    )
    expect(getUser().profile).toBeNull()
  })

  it('says whether the server answers', async () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<ProfilePage />)
    expect(await screen.findByText('Ligado ao servidor')).toBeInTheDocument()
  })

  it('says when the server does not answer', async () => {
    mockFetchJson({ message: 'down' }, 503)
    renderWithApp(<ProfilePage />)
    expect(await screen.findByText('Sem ligação ao servidor', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})
