import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../test/render'
import CoursePage from './CoursePage'
import { DEMO_PROGRAMS } from '../../test/programs'
// The real catalogue has no made-up programs any more: the ranking is tested with the old demo ones.
vi.mock('../../data/source', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../data/source')>()
  return {
    ...real,
    listPrograms: async (career?: string) =>
      DEMO_PROGRAMS.filter((program) => !career || program.careers.includes(career)),
  }
})

const open = (route: string) => renderWithApp(<CoursePage />, { route, path: '/cursos/:id' })

describe('CoursePage', () => {
  it('shows the course, every institution that offers it, and the chosen offer in full', async () => {
    open('/cursos/figma-benguela')
    expect(await screen.findByRole('heading', { level: 1, name: 'Design UI/UX' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /tipos de letra/ })).toBeInTheDocument()
    expect(screen.getByText('2 instituições')).toBeInTheDocument()

    const offers = screen.getByRole('region', { name: 'Instituições que oferecem este curso' })
    const chosen = within(offers).getByRole('link', { current: 'page' })
    expect(chosen).toHaveTextContent(/Centro de Formação Exemplo Benguela/)
    expect(within(offers).getByRole('link', { name: /Academia Digital Exemplo/ })).toHaveAttribute(
      'href',
      '/cursos/ui-ux',
    )

    const offer = screen.getByRole('region', { name: 'Figma e Design de Interfaces' })
    expect(within(offer).getByText(/na classificação Kayé/)).toBeInTheDocument()
    expect(within(offer).getByRole('button', { name: 'Comparar' })).toBeInTheDocument()
    const careers = screen.getByRole('region', { name: 'Profissões a que leva' })
    expect(within(careers).getByRole('link', { name: /Designer UI\/UX/ })).toHaveAttribute(
      'href',
      '/carreiras/designer-ui-ux',
    )
    expect(screen.getByRole('link', { name: 'Cursos' })).toHaveAttribute('href', '/cursos')
  })

  it('keeps the career on every link and says which step of it the course serves', async () => {
    open('/cursos/web-react?carreira=desenvolvedor-frontend')
    expect(await screen.findByText(/Como te leva até Desenvolvedor Frontend/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cursos' })).toHaveAttribute(
      'href',
      '/cursos?carreira=desenvolvedor-frontend',
    )
    const offers = screen.getByRole('region', { name: 'Instituições que oferecem este curso' })
    expect(within(offers).getAllByRole('listitem')).toHaveLength(3)
    expect(within(offers).getByRole('link', { name: /Escola Online Exemplo/ })).toHaveAttribute(
      'href',
      '/cursos/bootcamp-frontend?carreira=desenvolvedor-frontend',
    )
    expect(within(offers).getByText('Por confirmar')).toBeInTheDocument()
  })

  it('gives no place to an offer still awaiting recognition', async () => {
    open('/cursos/bootcamp-frontend')
    const offer = await screen.findByRole('region', { name: 'Bootcamp de Frontend' })
    expect(within(offer).queryByText(/na classificação Kayé/)).not.toBeInTheDocument()
  })

  it('says so when only one institution offers the course', async () => {
    open('/cursos/estatistica')
    expect(await screen.findByText('Por agora, só uma instituição oferece este curso.')).toBeInTheDocument()
  })

  it('says when a course does not exist', async () => {
    open('/cursos/nao-existe')
    expect(await screen.findByText('Este curso não existe ou já não está disponível.')).toBeInTheDocument()
  })
})
