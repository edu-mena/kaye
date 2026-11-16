import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import CatalogCoursePage from './CatalogCoursePage'

const open = (route: string) => renderWithApp(<CatalogCoursePage />, { route, path: '/cursos/curso/:id' })

describe('CatalogCoursePage', () => {
  it('shows where to study the course, the institution it was opened from first, and the careers', async () => {
    open('/cursos/curso/enfermagem?academia=uan&secao=ofertas')
    expect(await screen.findByRole('heading', { level: 1, name: 'Enfermagem' })).toBeInTheDocument()

    const where = screen.getByRole('region', { name: 'Academias e ofertas' })
    const first = within(where).getAllByRole('article')[0]
    expect(first).toHaveAccessibleName('Universidade Agostinho Neto')
    expect(first).toHaveTextContent('A ver')
    expect(within(first ?? where).getByRole('link')).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/academias\/uan\?curso=enfermagem&nivel=/),
    )

    expect(await screen.findByRole('link', { name: 'Enfermeiro' })).toHaveAttribute(
      'href',
      '/carreiras/enfermeiro',
    )
  })

  it('shows the plan of studies of the institution it was opened from, with its decree', async () => {
    open('/cursos/curso/enfermagem?academia=escola-superior-de-saude-castelo')
    const plan = await screen.findByRole('region', { name: 'Plano de estudos' })
    expect(within(plan).getByRole('combobox', { name: 'Instituição' })).toHaveValue(
      'escola-superior-de-saude-castelo',
    )
    expect(within(plan).getByRole('heading', { name: '1.º ano · 1.º semestre' })).toBeInTheDocument()
    expect(within(plan).getByText('Introdução à Enfermagem')).toBeInTheDocument()
    expect(within(plan).getByRole('link', { name: /Decreto Executivo n.º 174\/23/ })).toHaveAttribute(
      'href',
      expect.stringContaining('lex.ao'),
    )
  })

  it('says when no plan of studies is on record yet', async () => {
    open('/cursos/curso/medicina')
    expect(await screen.findByText(/Ainda não temos o plano de estudos deste curso/)).toBeInTheDocument()
  })

  it('answers an unknown course with a way back', async () => {
    open('/cursos/curso/nao-existe')
    expect(await screen.findByRole('heading', { name: 'Não encontrámos este curso' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Cursos/ })).toHaveAttribute('href', '/cursos')
  })
})
