import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import CompaniesPage from './CompaniesPage'

const count = (text: string) => screen.getByText(text, { selector: 'output' })

describe('CompaniesPage', () => {
  it('shows each company with its logo, its sector and its youth programmes', async () => {
    renderWithApp(<CompaniesPage />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Empresas' })).toBeInTheDocument()
    expect(count('22 empresas')).toBeInTheDocument()

    const bai = screen.getByRole('article', { name: 'Banco BAI' })
    expect(within(bai).getByText('Banca')).toBeInTheDocument()
    expect(within(bai).getByText('Programas para jovens')).toBeInTheDocument()
    expect(within(bai).getByRole('link', { name: 'Banco BAI' })).toHaveAttribute('href', '/empresas/bai')
    expect(
      screen.getByRole('article', { name: 'Unitel' }).querySelector('img[src*="unitel-logo"]'),
    ).not.toBeNull()
  })

  it('answers the hero question: who hires for a career', async () => {
    renderWithApp(<CompaniesPage />)
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Que profissão procuras?' }),
      'analista-de-ciberseguranca',
    )
    expect(
      await screen.findByRole('heading', { name: 'Empresas que contratam Analista de Cibersegurança' }),
    ).toBeInTheDocument()
    expect(count('7 empresas')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('?profissao=analista-de-ciberseguranca')
  })

  it('shows the filters that fit the sector and clears them when the sector changes', async () => {
    renderWithApp(<CompaniesPage />)
    const sector = await screen.findByRole('combobox', { name: 'Setor' })
    await userEvent.selectOptions(sector, 'banca')
    expect(count('6 empresas')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Programas para jovens' }), 'sim')
    expect(count('1 empresa')).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Banco BAI' })).toBeInTheDocument()

    // No TV company has a youth programme: the filter goes, and so does its value.
    await userEvent.selectOptions(sector, 'televisao')
    expect(screen.queryByRole('combobox', { name: 'Programas para jovens' })).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).not.toHaveTextContent('programas=')
    expect(count('2 empresas')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(count('22 empresas')).toBeInTheDocument()
  })

  it('filters by area and says when nothing matches', async () => {
    renderWithApp(<CompaniesPage />, { route: '/?setor=banca' })
    await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Área' }), 'seguranca')
    expect(count('5 empresas')).toBeInTheDocument()
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Que profissão procuras?' }),
      'tecnico-de-telecomunicacoes',
    )
    expect(screen.getByText('Nenhuma empresa com estes filtros.')).toBeInTheDocument()
  })

  it('ignores filters it does not know in the address', async () => {
    renderWithApp(<CompaniesPage />, {
      route: '/?setor=pesca&area=magia&programas=talvez&profissao=x&onde=Marte',
    })
    expect(await screen.findByText('22 empresas', { selector: 'output' })).toBeInTheDocument()
  })

  it('shows 12 companies a page and goes back to the first when a filter changes', async () => {
    renderWithApp(<CompaniesPage />)
    const list = await screen.findByRole('list', { name: 'Empresas' })
    expect(within(list).getAllByRole('article')).toHaveLength(12)

    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }))
    expect(within(screen.getByRole('list', { name: 'Empresas' })).getAllByRole('article')).toHaveLength(10)
    expect(screen.getByTestId('location')).toHaveTextContent('pagina=2')

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Setor' }), 'banca')
    expect(screen.getByTestId('location')).not.toHaveTextContent('pagina')
    expect(screen.queryByRole('navigation', { name: 'Páginas de empresas' })).not.toBeInTheDocument()
  })
})
