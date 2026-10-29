import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import SupportPage from './SupportPage'

describe('SupportPage', () => {
  it('answers the frequent questions in groups, one at a time', async () => {
    renderWithApp(<SupportPage />)

    for (const name of ['O Kayé', 'A tua conta e os teus dados', 'O teste e as recomendações', 'O Mercado']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument()
    }
    const answer = screen.getByText(/Tudo é grátis/)
    expect(answer).not.toBeVisible()
    await userEvent.click(screen.getByText('Tenho de pagar alguma coisa?'))
    expect(answer).toBeVisible()
  })

  it('has shortcuts to the test, the CV, the comparison and the data, and the legal pages', () => {
    renderWithApp(<SupportPage />)

    const shortcuts = within(screen.getByRole('region', { name: 'Atalhos' }))
    expect(shortcuts.getByRole('link', { name: 'Os teus dados' })).toHaveAttribute('href', '/configuracoes')
    expect(shortcuts.getAllByRole('link')).toHaveLength(4)
    expect(
      within(screen.getByRole('region', { name: 'Termos e privacidade' })).getAllByRole('link').length,
    ).toBe(2)
  })
})
