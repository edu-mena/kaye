import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import ComparePage from './ComparePage'
import TrainingPage from './TrainingPage'

const rankedNames = () =>
  within(screen.getByRole('list', { name: 'Cursos classificados' }))
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)

describe('TrainingPage', () => {
  it('publishes the criteria and their weights next to the ranking', async () => {
    renderWithApp(<TrainingPage />)
    expect(await screen.findByRole('heading', { name: 'Como calculamos' })).toBeInTheDocument()
    const criteria = within(screen.getByRole('list', { name: 'Critérios da pontuação' })).getAllByRole(
      'listitem',
    )
    expect(criteria[0]).toHaveTextContent(/Avaliação de alunos\s*40%/)
    expect(screen.getByText(/Nada pago entra na pontuação/)).toBeInTheDocument()
  })

  it('ranks only recognised courses and lists the others apart', async () => {
    renderWithApp(<TrainingPage />, { route: '/cursos?carreira=desenvolvedor-frontend' })
    await screen.findByText('Desenvolvimento Web com React')
    expect(rankedNames()).not.toContain('Bootcamp de Frontend')
    const apart = screen.getByRole('region', { name: 'Reconhecimento por confirmar' })
    expect(within(apart).getByText('Bootcamp de Frontend')).toBeInTheDocument()
  })

  it('reorders by price and filters by province', async () => {
    renderWithApp(<TrainingPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Mais barato' }))
    expect(rankedNames()[0]).toBe('Figma e Design de Interfaces')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Onde' }), 'Online')
    expect(screen.getByTestId('location')).toHaveTextContent('onde=Online')
    expect(screen.getByText('Bootcamp de Frontend')).toBeInTheDocument()
    expect(screen.queryByText('Figma e Design de Interfaces')).not.toBeInTheDocument()
  })

  it('shows the ranked courses in one row and filters by level', async () => {
    renderWithApp(<TrainingPage />)
    expect(await screen.findByText('12 cursos classificados', { selector: 'output' })).toBeInTheDocument()
    expect(rankedNames()).toHaveLength(12)

    await userEvent.click(screen.getByRole('button', { name: /^Licenciatura\s*5 cursos$/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('nivel=licenciatura')
    expect(rankedNames()).toHaveLength(5)
  })

  it('opens each course on its own page from the whole card', async () => {
    renderWithApp(<TrainingPage />, { route: '/cursos?carreira=designer-ui-ux' })
    expect(await screen.findByRole('link', { name: 'Figma e Design de Interfaces' })).toHaveAttribute(
      'href',
      '/cursos/figma-benguela?carreira=designer-ui-ux',
    )
  })

  it('filters by length, price, schedule and ownership, and clears them all', async () => {
    renderWithApp(<TrainingPage />)
    await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Duração' }), 'longa')
    expect(screen.getByText('6 cursos classificados', { selector: 'output' })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Instituição' }), 'publica')
    expect(screen.getByTestId('location')).toHaveTextContent('duracao=longa&gestao=publica')
    expect(screen.getByText('4 cursos classificados', { selector: 'output' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getByText('12 cursos classificados', { selector: 'output' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Custo total' }), 'ate200')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Horários' }), 'online')
    expect(screen.getByText('Bootcamp de Frontend')).toBeInTheDocument()
    expect(screen.getByText(/Nenhum curso reconhecido com estes filtros/)).toBeInTheDocument()
  })

  it('collects up to 3 courses to compare', async () => {
    renderWithApp(<TrainingPage />)
    const buttons = await screen.findAllByRole('button', { name: 'Comparar' })
    for (const button of buttons.slice(0, 3)) await userEvent.click(button)
    expect(getUser().compare).toHaveLength(3)
    expect(screen.getByText('3 cursos para comparar')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Comparar' })[0]).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Comparar' })).toHaveAttribute('href', '/cursos/comparar')
  })

  it('says so when no course matches', async () => {
    renderWithApp(<TrainingPage />, { route: '/cursos?carreira=designer-ui-ux&onde=Online' })
    expect(await screen.findByText('Não há cursos com estes filtros.')).toBeInTheDocument()
  })
})

describe('ComparePage', () => {
  it('puts the chosen courses side by side and removes one', async () => {
    seedUser({ compare: ['web-react', 'bootcamp-frontend'] })
    renderWithApp(<ComparePage />)
    const table = await screen.findByRole('table')
    expect(
      within(table).getByRole('columnheader', { name: /Desenvolvimento Web com React/ }),
    ).toBeInTheDocument()
    expect(within(table).getByRole('row', { name: /Custo total/ })).toHaveTextContent('280.000 Kz150.000 Kz')
    expect(within(table).getByRole('row', { name: /Pontuação Kayé/ })).toHaveTextContent(
      'Reconhecimento por confirmar',
    )

    await userEvent.click(within(table).getAllByRole('button', { name: 'Tirar da comparação' })[1]!)
    expect(getUser().compare).toEqual(['web-react'])
  })

  it('explains how to start when nothing is chosen', async () => {
    renderWithApp(<ComparePage />)
    expect(await screen.findByText(/Escolhe até 3 cursos/)).toBeInTheDocument()
  })
})
