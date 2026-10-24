import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { seedTested } from '../../test/user'
import CareersPage from './CareersPage'

describe('CareersPage', () => {
  it('lists every career, high demand first', async () => {
    renderWithApp(<CareersPage />)
    expect(await screen.findByText('27 profissões')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Para ti' })).not.toBeInTheDocument()
  })

  it('searches without caring about accents and keeps the search in the address', async () => {
    renderWithApp(<CareersPage />)
    await userEvent.type(
      await screen.findByRole('searchbox', { name: 'Procurar uma profissão' }),
      'ciberseguranca',
    )
    expect(screen.getByText('1 profissão', { selector: 'output' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Analista de Cibersegurança/ })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('?q=ciberseguranca')
  })

  it('filters by area and clears the filter on a second press', async () => {
    renderWithApp(<CareersPage />)
    const design = await screen.findByRole('button', { name: /^Design/ })
    await userEvent.click(design)
    expect(screen.getByText('2 profissões', { selector: 'output' })).toBeInTheDocument()
    await userEvent.click(design)
    expect(screen.getByText('27 profissões', { selector: 'output' })).toBeInTheDocument()
  })

  it('shows 12 careers a page and starts again on the first page when a filter changes', async () => {
    renderWithApp(<CareersPage />)
    const list = await screen.findByRole('region', { name: 'Todas as profissões' })
    expect(within(list).getAllByRole('link')).toHaveLength(12)
    const pages = screen.getByRole('navigation', { name: 'Páginas de profissões' })
    expect(within(pages).getByRole('button', { name: 'Página anterior' })).toBeDisabled()

    await userEvent.click(within(pages).getByRole('button', { name: 'Página 3' }))
    expect(screen.getByTestId('location')).toHaveTextContent('pagina=3')
    expect(within(list).getAllByRole('link')).toHaveLength(3)
    expect(within(pages).getByRole('button', { name: 'Página seguinte' })).toBeDisabled()
    await userEvent.click(within(pages).getByRole('button', { name: 'Página anterior' }))
    expect(within(pages).getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(within(pages).getByRole('button', { name: 'Página 1' }))
    expect(screen.getByTestId('location')).not.toHaveTextContent('pagina')

    await userEvent.click(within(pages).getByRole('button', { name: 'Página seguinte' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Área' }), 'design')
    expect(screen.getByTestId('location')).toHaveTextContent('area=design')
    expect(screen.getByTestId('location')).not.toHaveTextContent('pagina')
    expect(screen.queryByRole('navigation', { name: 'Páginas de profissões' })).not.toBeInTheDocument()
  })

  it('filters by demand, salary and guide, and clears them all', async () => {
    renderWithApp(<CareersPage />)
    await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Salário mediano' }), 'mais500')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Procura' }), 'alta')
    expect(screen.getByTestId('location')).toHaveTextContent('salario=mais500&procura=alta')
    const count = Number(screen.getByText(/profiss/, { selector: 'output' }).textContent?.split(' ')[0])
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThan(27)

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getByText('27 profissões', { selector: 'output' })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Página' }), 'guia')
    expect(screen.getByText('3 profissões', { selector: 'output' })).toBeInTheDocument()
  })

  it('says so when nothing matches', async () => {
    renderWithApp(<CareersPage />, { route: '/carreiras?q=medicina' })
    expect(await screen.findByText('Nenhuma profissão encontrada. Tenta outra palavra.')).toBeInTheDocument()
  })

  it('offers "Para ti" and the match after the test', async () => {
    seedTested()
    renderWithApp(<CareersPage />)
    expect(await screen.findByRole('button', { name: 'Para ti' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('Combina muito').length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'Mais bem pagas' }))
    expect(screen.getByTestId('location')).toHaveTextContent('ordem=salary')
  })
})
