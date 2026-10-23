import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedTested, seedUser } from '../../test/user'
import CareerPage from './CareerPage'

const open = (slug: string) =>
  renderWithApp(<CareerPage />, { route: `/carreiras/${slug}`, path: '/carreiras/:slug' })

describe('CareerPage', () => {
  it('shows every part of the career, with employer asks as aggregated numbers only', async () => {
    open('desenvolvedor-frontend')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Desenvolvedor Frontend' }),
    ).toBeInTheDocument()
    for (const section of [
      'O que faz',
      'Características',
      'O que pedem',
      'Como lá chegar',
      'Onde estudar',
      'Mercado',
      'CVs modelo',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: section })).toBeInTheDocument()
    }
    expect(screen.getByText('Em 58 vagas de exemplo desta profissão:')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Competências mais pedidas' })).toHaveTextContent('JavaScript86%')
    expect(screen.getByText('Só números agregados: o Kayé não publica vagas.')).toBeInTheDocument()
    expect(getUser().visitedCareers).toEqual(['desenvolvedor-frontend'])
  })

  it('saves the career and makes it the destination', async () => {
    open('analista-de-dados')
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Escolher como destino' }))
    expect(getUser()).toMatchObject({
      savedCareers: ['analista-de-dados'],
      targetCareer: 'analista-de-dados',
    })
    expect(screen.getByRole('button', { name: 'Guardada' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'O teu destino' }))
    expect(getUser().targetCareer).toBeNull()
  })

  it('draws the path with what is done, where the person is, and what is ahead', async () => {
    seedUser()
    open('desenvolvedor-frontend')
    await userEvent.click(await screen.findByRole('button', { name: 'Via técnica' }))
    const path = screen.getByRole('heading', { name: 'Como lá chegar' }).closest('section')!
    expect(within(path).getAllByText(/· Feito/)).toHaveLength(2)
    expect(within(path).getByText(/· Estás aqui/)).toBeInTheDocument()
    expect(within(path).getByText('Curso profissional de desenvolvimento web')).toBeInTheDocument()
    expect(within(path).getByText('Duração: 5 a 6 anos')).toBeInTheDocument()
  })

  it('ranks where to study with the same scores as the Formação page', async () => {
    open('desenvolvedor-frontend')
    const study = (await screen.findByRole('heading', { name: 'Onde estudar' })).closest('section')!
    expect(await within(study).findByText('Desenvolvimento Web com React')).toBeInTheDocument()
    expect(within(study).getByRole('link', { name: /Ver todos os cursos/ })).toHaveAttribute(
      'href',
      '/formacao?carreira=desenvolvedor-frontend',
    )
  })

  it('opens a career that is still being curated without inventing content', async () => {
    open('product-manager')
    expect(await screen.findByRole('heading', { level: 1, name: 'Product Manager' })).toBeInTheDocument()
    expect(screen.getByText(/Estamos a preparar esta página/)).toBeInTheDocument()
  })

  it('says when a career does not exist', async () => {
    open('nao-existe')
    expect(
      await screen.findByText('Esta profissão não existe ou ainda não foi publicada.'),
    ).toBeInTheDocument()
  })
})

describe('FitPanel', () => {
  it('invites the test and the profile when they are missing', async () => {
    open('designer-ui-ux')
    const fit = await screen.findByRole('region', { name: 'O meu encaixe' })
    expect(within(fit).getByRole('link', { name: 'Faz o teste vocacional para saber.' })).toHaveAttribute(
      'href',
      '/teste',
    )
    expect(
      within(fit).getByRole('link', { name: 'Diz-nos a tua escolaridade no perfil.' }),
    ).toBeInTheDocument()
  })

  it('updates the skills part as soon as the person marks what they know', async () => {
    seedTested()
    open('desenvolvedor-frontend')
    const fit = await screen.findByRole('region', { name: 'O meu encaixe' })
    // The profile needs the questions, which load like any API data.
    expect(await within(fit).findByText('Combina muito')).toBeInTheDocument()
    expect(within(fit).getByText('Faltam 3 passos, pela via técnica')).toBeInTheDocument()
    expect(within(fit).getByText('Já tens 0 de 6 essenciais')).toBeInTheDocument()

    await userEvent.click(within(fit).getByRole('button', { name: 'Marcar o que sei' }))
    const dialog = screen.getByRole('dialog', { name: 'O que já sabes?' })
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'React' })).getByRole('button', { name: 'Sei fazer' }),
    )
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'Git' })).getByRole('button', { name: 'A aprender' }),
    )
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'Git' })).getByRole('button', { name: 'Ainda não' }),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Feito' }))

    expect(getUser().skills).toEqual({ react: 'sei' })
    expect(within(fit).getByText('Já tens 1 de 6 essenciais')).toBeInTheDocument()
  })
})
