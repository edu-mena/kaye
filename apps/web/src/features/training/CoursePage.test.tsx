import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import CoursePage from './CoursePage'

const open = (route: string) => renderWithApp(<CoursePage />, { route, path: '/cursos/:id' })

describe('CoursePage', () => {
  it('shows the course in full, with its place, its photo and the careers it leads to', async () => {
    open('/cursos/figma-benguela')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Figma e Design de Interfaces' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /tipos de letra/ })).toBeInTheDocument()
    expect(screen.getByText(/na classificação Kayé/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comparar' })).toBeInTheDocument()
    const careers = screen.getByRole('region', { name: 'Profissões a que leva' })
    expect(within(careers).getByRole('link', { name: /Designer UI\/UX/ })).toHaveAttribute(
      'href',
      '/carreiras/designer-ui-ux',
    )
    expect(screen.getByRole('link', { name: 'Cursos' })).toHaveAttribute('href', '/cursos')
  })

  it('says which step of a career the course serves when it comes from that career', async () => {
    open('/cursos/web-react?carreira=desenvolvedor-frontend')
    expect(await screen.findByText(/Como te leva até Desenvolvedor Frontend/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cursos' })).toHaveAttribute(
      'href',
      '/cursos?carreira=desenvolvedor-frontend',
    )
  })

  it('gives no place to a course still awaiting recognition', async () => {
    open('/cursos/bootcamp-frontend')
    expect(await screen.findByRole('heading', { level: 1, name: 'Bootcamp de Frontend' })).toBeInTheDocument()
    expect(screen.queryByText(/na classificação Kayé/)).not.toBeInTheDocument()
  })

  it('says when a course does not exist', async () => {
    open('/cursos/nao-existe')
    expect(await screen.findByText('Este curso não existe ou já não está disponível.')).toBeInTheDocument()
  })
})
