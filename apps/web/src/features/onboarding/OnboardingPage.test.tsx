import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import OnboardingPage from './OnboardingPage'

const year = new Date().getFullYear()

async function fillProfile({ birthYear }: { birthYear: number }) {
  await userEvent.type(screen.getByLabelText('Como te chamas?'), '  Edson  ')
  await userEvent.selectOptions(screen.getByLabelText('Ano em que nasceste'), String(birthYear))
  await userEvent.selectOptions(screen.getByLabelText('Província'), 'Huíla')
  await userEvent.selectOptions(screen.getByLabelText('Último nível que concluíste'), 'ii_ciclo')
}

describe('OnboardingPage', () => {
  it('goes from welcome to the profile and then to "Por onde começamos?"', async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar' })
    expect(screen.getByRole('heading', { name: 'O teu lugar na tecnologia começa aqui' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))
    await fillProfile({ birthYear: year - 20 })
    await userEvent.click(screen.getByLabelText(/Aceito os termos/))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(screen.getByRole('heading', { name: 'Por onde começamos?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ainda não sei o que quero/ })).toHaveAttribute('href', '/teste')
    expect(getUser().profile).toEqual({
      name: 'Edson',
      birthYear: year - 20,
      province: 'Huíla',
      education: 'ii_ciclo',
      guardianInformed: false,
    })
  })

  it('says what is missing and saves nothing', async () => {
    renderWithApp(<OnboardingPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(screen.getAllByText('Falta responder a isto')).toHaveLength(5)
    expect(screen.getByLabelText('Como te chamas?')).toHaveAttribute('aria-invalid', 'true')
    expect(getUser().profile).toBeNull()
  })

  it('asks a minor to confirm that their guardian knows, and keeps the profile private', async () => {
    renderWithApp(<OnboardingPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))
    await fillProfile({ birthYear: year - 15 })
    expect(screen.getByText('Tens menos de 18 anos')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText(/Aceito os termos/))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(getUser().profile).toBeNull()

    await userEvent.click(screen.getByLabelText('O meu encarregado de educação sabe que uso o Kayé'))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(getUser().profile).toMatchObject({ guardianInformed: true })
  })

  it('returns to the page that asked for a profile, but never outside the app', async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar?next=%2Fcv%2Feditar', path: '/entrar' })
    await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))
    await fillProfile({ birthYear: year - 22 })
    await userEvent.click(screen.getByLabelText(/Aceito os termos/))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/cv/editar')
  })

  it('ignores a next that points to another site', async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar?next=%2F%2Fevil.example' })
    await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))
    await fillProfile({ birthYear: year - 22 })
    await userEvent.click(screen.getByLabelText(/Aceito os termos/))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('heading', { name: 'Por onde começamos?' })).toBeInTheDocument()
  })

  it('lets people read the terms and the policy without losing what they filled in', async () => {
    renderWithApp(<OnboardingPage />, { route: '/entrar' })
    await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))

    expect(
      screen.getByRole('checkbox', { name: 'Aceito os termos de uso e a política de privacidade' }),
    ).not.toBeChecked()
    for (const [name, href] of [
      ['Termos de uso', '/termos'],
      ['Política de privacidade', '/privacidade'],
    ]) {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
    }
  })

  it('goes straight to the choices when there is already a profile', () => {
    seedUser()
    renderWithApp(<OnboardingPage />)
    expect(screen.getByRole('heading', { name: 'Por onde começamos?' })).toBeInTheDocument()
  })
})
