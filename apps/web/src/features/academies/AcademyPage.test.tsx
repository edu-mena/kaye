import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    expect(within(offer).getByText('Reconhecimento oficial')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Site oficial' })).toHaveAttribute('href', 'https://uan.ao')
    expect(screen.getByRole('heading', { name: 'Antes de te inscreveres' })).toBeInTheDocument()
    expect(screen.getAllByText('Em breve')).toHaveLength(2)
  })

  it('opens a course in a dialog with its offer, its plan of studies and a way to the course', async () => {
    open('uan')
    const offer = await screen.findByRole('article', { name: 'Engenharia Informática' })
    await userEvent.click(
      within(offer).getByRole('button', { name: 'Ver a oferta de Engenharia Informática' }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Engenharia Informática' })
    expect(within(dialog).getAllByText('Por confirmar')).toHaveLength(3)
    expect(within(dialog).getByRole('link', { name: 'Decreto 480/17' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
    expect(
      within(dialog).getByText(/Ainda não temos o plano de estudos desta instituição/),
    ).toBeInTheDocument()
    expect(await within(dialog).findByRole('link', { name: 'Desenvolvedor Backend' })).toHaveAttribute(
      'href',
      '/carreiras/desenvolvedor-backend',
    )
    expect(within(dialog).getByRole('link', { name: 'Ver mais sobre o curso' })).toHaveAttribute(
      'href',
      '/cursos/curso/engenharia-informatica?academia=uan',
    )
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
