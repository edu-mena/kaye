import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import AcademyPage from './AcademyPage'

const open = (id: string) =>
  renderWithApp(<AcademyPage />, { route: `/academias/${id}`, path: '/academias/:id' })

describe('AcademyPage', () => {
  it('shows what a source confirms and says what is still to confirm', async () => {
    open('uan')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Universidade Agostinho Neto' }),
    ).toBeInTheDocument()

    const offer = screen.getByRole('article', { name: 'Engenharia Informática' })
    expect(within(offer).getByText(/Faculdade de Engenharia/)).toBeInTheDocument()
    expect(within(offer).getAllByText('Por confirmar')).toHaveLength(3)
    const decree = within(offer).getByRole('link', { name: 'Decreto 480/17' })
    expect(decree).toHaveAttribute('rel', 'noopener noreferrer')
    expect(await within(offer).findByRole('link', { name: 'Desenvolvedor Backend' })).toHaveAttribute(
      'href',
      '/carreiras/desenvolvedor-backend',
    )

    expect(screen.getByRole('link', { name: 'Site oficial' })).toHaveAttribute('href', 'https://uan.ao')
    expect(screen.getByRole('heading', { name: 'Antes de te inscreveres' })).toBeInTheDocument()
    expect(screen.getAllByText('Em breve')).toHaveLength(3)
  })

  it('says when no course is confirmed yet', async () => {
    open('inefop')
    expect(
      await screen.findByText('Ainda não temos nenhum curso confirmado desta instituição.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Antes de te inscreveres' })).not.toBeInTheDocument()
  })

  it('answers an unknown institution with a way back', async () => {
    open('nao-existe')
    expect(await screen.findByRole('heading', { name: 'Instituição não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voltar às academias/ })).toHaveAttribute('href', '/academias')
  })
})
