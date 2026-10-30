import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CAREER_SUMMARIES } from '../../data/demo/careers'
import { renderWithApp } from '../../test/render'
import { seedTested } from '../../test/user'
import CareersPage from './CareersPage'

const ALL = `${CAREER_SUMMARIES.length} profissões`
const PAGES = Math.ceil(CAREER_SUMMARIES.length / 12)

describe('CareersPage', () => {
  it('lists every career, high demand first', async () => {
    renderWithApp(<CareersPage />)
    expect(await screen.findByText(ALL)).toBeInTheDocument()
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
    expect(screen.getByText(ALL, { selector: 'output' })).toBeInTheDocument()
  })

  it('shows the groups of one area at a time, and the area of a group chosen in the filter', async () => {
    renderWithApp(<CareersPage />)
    const areas = await screen.findByRole('group', { name: 'Explora por área' })
    expect(within(areas).getByRole('button', { name: 'Tecnologia e telecomunicações' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByRole('button', { name: /^Medicina/ })).not.toBeInTheDocument()

    await userEvent.click(within(areas).getByRole('button', { name: 'Saúde' }))
    expect(screen.getByRole('button', { name: /^Medicina/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Design/ })).not.toBeInTheDocument()

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Área' }), 'turismo')
    expect(within(areas).getByRole('button', { name: 'Turismo e hotelaria' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByRole('button', { name: /^Turismo e hotelaria.*profiss/, pressed: true }),
    ).toBeInTheDocument()
  })

  it('shows 12 careers a page and starts again on the first page when a filter changes', async () => {
    renderWithApp(<CareersPage />)
    const list = await screen.findByRole('region', { name: 'Todas as profissões' })
    expect(within(list).getAllByRole('link')).toHaveLength(12)
    const pages = screen.getByRole('navigation', { name: 'Páginas de profissões' })
    expect(within(pages).getByRole('button', { name: 'Página anterior' })).toBeDisabled()

    await userEvent.click(within(pages).getByRole('button', { name: `Página ${PAGES}` }))
    expect(screen.getByTestId('location')).toHaveTextContent(`pagina=${PAGES}`)
    expect(within(list).getAllByRole('link')).toHaveLength(CAREER_SUMMARIES.length - (PAGES - 1) * 12)
    expect(within(pages).getByRole('button', { name: 'Página seguinte' })).toBeDisabled()
    await userEvent.click(within(pages).getByRole('button', { name: 'Página anterior' }))
    expect(within(pages).getByRole('button', { name: `Página ${PAGES - 1}` })).toHaveAttribute(
      'aria-current',
      'page',
    )
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
    expect(count).toBeLessThan(CAREER_SUMMARIES.length)

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getByText(ALL, { selector: 'output' })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Página' }), 'guia')
    expect(screen.getByText('3 profissões', { selector: 'output' })).toBeInTheDocument()
  })

  it('says so when nothing matches', async () => {
    renderWithApp(<CareersPage />, { route: '/carreiras?q=astronauta' })
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
