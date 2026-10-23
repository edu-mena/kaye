import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { changeLocale } from '../lib/i18n'
import { renderWithApp } from '../test/render'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('shows the five tabs', () => {
    renderWithApp(<BottomNav />)

    const labels = screen.getAllByRole('link').map((link) => link.textContent)
    expect(labels).toEqual(['Início', 'Explorar', 'Vagas', 'CV', 'Perfil'])
  })

  it('marks only the current tab as active', () => {
    renderWithApp(<BottomNav />, { route: '/vagas' })

    expect(screen.getByRole('link', { name: 'Vagas' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current')
  })

  it('follows the current language', () => {
    changeLocale('fr')
    renderWithApp(<BottomNav />)

    expect(screen.getByRole('link', { name: 'Offres' })).toHaveAttribute('href', '/vagas')
  })
})
