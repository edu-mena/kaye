import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { changeLocale } from '../lib/i18n'
import { renderWithApp } from '../test/render'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('shows the five tabs of a guidance app, with no job board', () => {
    renderWithApp(<BottomNav />)

    const labels = screen.getAllByRole('link').map((link) => link.textContent)
    expect(labels).toEqual(['Início', 'Carreiras', 'Formação', 'CV', 'Perfil'])
    expect(screen.queryByRole('link', { name: 'Vagas' })).not.toBeInTheDocument()
  })

  it('marks only the current tab as active', () => {
    renderWithApp(<BottomNav />, { route: '/formacao' })

    expect(screen.getByRole('link', { name: 'Formação' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current')
  })

  it('follows the current language', () => {
    changeLocale('fr')
    renderWithApp(<BottomNav />)

    expect(screen.getByRole('link', { name: 'Métiers' })).toHaveAttribute('href', '/carreiras')
  })
})
