import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import AcademyPage from './AcademyPage'

const open = (id: string) =>
  renderWithApp(<AcademyPage />, { route: `/academias/${id}`, path: '/academias/:id' })

describe('AcademyPage', () => {
  it('shows what the institution is, its contacts and what to check before enrolling', async () => {
    open('uan')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Universidade Agostinho Neto' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Site oficial' })).toHaveAttribute('href', 'https://uan.ao')
    expect(screen.getByRole('heading', { name: 'Antes de te inscreveres' })).toBeInTheDocument()
  })

  it('opens a course from the address in a dialog: its offer, its decree and a way to the course', async () => {
    open('uan?secao=cursos&curso=engenharia-informatica')

    const dialog = await screen.findByRole('dialog', { name: 'Engenharia Informática' })
    expect(within(dialog).getByText(/Licenciatura · Faculdade de Engenharia/)).toBeInTheDocument()
    // Length and schedule are still to confirm.
    expect(within(dialog).getAllByText('Por confirmar')).toHaveLength(2)
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

  it('lists the courses in their tab, each one opening its offer', async () => {
    open('ula?secao=cursos')
    const cards = await screen.findAllByRole('article')
    const first = cards.find((card) => card.getAttribute('aria-label'))
    const name = first?.getAttribute('aria-label') ?? ''
    await userEvent.click(
      within(first as HTMLElement).getByRole('button', { name: `Ver a oferta de ${name}` }),
    )
    expect(screen.getByRole('dialog', { name })).toBeInTheDocument()
  })

  it('says when no course is confirmed yet', async () => {
    open('inefop?secao=cursos')
    expect(
      await screen.findByText('Ainda não temos nenhum curso confirmado desta instituição.'),
    ).toBeInTheDocument()
  })

  it('answers an unknown institution with a way back', async () => {
    open('nao-existe')
    expect(await screen.findByRole('heading', { name: 'Instituição não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voltar às academias/ })).toHaveAttribute('href', '/academias')
  })
})
