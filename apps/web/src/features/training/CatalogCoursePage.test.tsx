import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import CatalogCoursePage from './CatalogCoursePage'

const open = (route: string) => renderWithApp(<CatalogCoursePage />, { route, path: '/cursos/curso/:id' })

describe('CatalogCoursePage', () => {
  it('shows where to study the course, the institution it was opened from first, and the careers', async () => {
    open('/cursos/curso/enfermagem?academia=uan')
    expect(await screen.findByRole('heading', { level: 1, name: 'Enfermagem' })).toBeInTheDocument()

    const where = screen.getByRole('region', { name: 'Onde estudar' })
    const first = within(where).getAllByRole('article')[0]
    expect(first).toHaveAccessibleName('Universidade Agostinho Neto')
    expect(first).toHaveTextContent('A ver')
    expect(within(first ?? where).getByRole('link')).toHaveAttribute('href', '/academias/uan')

    expect(await screen.findByRole('link', { name: 'Enfermeiro' })).toHaveAttribute(
      'href',
      '/carreiras/enfermeiro',
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
