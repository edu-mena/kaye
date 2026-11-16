import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import CompaniesPage from './CompaniesPage'
import { listCompanies } from '../../data/source'
import type { Company } from '../../data/types'
import { clearFilter, pickFilter } from '../../test/filters'

const count = (text: string) => screen.getByText(text, { selector: 'output' })

const COMPANIES = await listCompanies()
const TOTAL = COMPANIES.length
const of = (test: (company: Company) => boolean) => COMPANIES.filter(test)
const BANKS = of((company) => company.sector === 'banca')
const CYBER = 'analista-de-ciberseguranca'
const companies = (list: Company[]) => (list.length === 1 ? '1 empresa' : `${list.length} empresas`)
const ALL = `${TOTAL} empresas`

describe('CompaniesPage', () => {
  it('shows each company with its logo, its sector and its youth programmes', async () => {
    renderWithApp(<CompaniesPage />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Empresas' })).toBeInTheDocument()
    expect(count(ALL)).toBeInTheDocument()

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
    await pickFilter('Que profissão procuras?', 'Analista de Cibersegurança')
    expect(
      await screen.findByRole('heading', { name: 'Empresas que contratam Analista de Cibersegurança' }),
    ).toBeInTheDocument()
    expect(count(companies(of((company) => company.careers.includes(CYBER))))).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(`?profissao=${CYBER}`)
  })

  it('shows the filters that fit the sector and clears them when the sector changes', async () => {
    renderWithApp(<CompaniesPage />)
    await pickFilter('Setor', 'Banca')
    expect(count(companies(BANKS))).toBeInTheDocument()

    await pickFilter('Programas para jovens', 'Com programas para jovens')
    expect(count(companies(BANKS.filter((company) => company.programs.length > 0)))).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Banco BAI' })).toBeInTheDocument()

    // No TV company has a youth programme: the filter goes, and so does its value.
    await clearFilter('Setor')
    await pickFilter('Setor', 'Televisão')
    expect(screen.queryByRole('combobox', { name: 'Programas para jovens' })).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).not.toHaveTextContent('programas=')
    expect(count(companies(of((company) => company.sector === 'televisao')))).toBeInTheDocument()

    // The phone row repeats the button (hidden there by CSS): the first one is the desktop row's.
    await userEvent.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0] as HTMLElement)
    expect(count(ALL)).toBeInTheDocument()
  })

  it('filters by area and says when nothing matches', async () => {
    renderWithApp(<CompaniesPage />, { route: '/?setor=banca' })
    await pickFilter('Área', 'Segurança')
    expect(
      count(companies(BANKS.filter((company) => company.areas.includes('seguranca')))),
    ).toBeInTheDocument()
    await pickFilter('Que profissão procuras?', 'Técnico de Telecomunicações')
    expect(screen.getByText('Nenhuma empresa com estes filtros.')).toBeInTheDocument()
  })

  it('ignores filters it does not know in the address', async () => {
    renderWithApp(<CompaniesPage />, {
      route: '/?setor=pesca&area=magia&programas=talvez&profissao=x&onde=Marte',
    })
    expect(await screen.findByText(ALL, { selector: 'output' })).toBeInTheDocument()
  })

  it('shows 12 companies a page and goes back to the first when a filter changes', async () => {
    renderWithApp(<CompaniesPage />)
    const list = await screen.findByRole('list', { name: 'Empresas' })
    expect(within(list).getAllByRole('article')).toHaveLength(12)

    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }))
    expect(within(screen.getByRole('list', { name: 'Empresas' })).getAllByRole('article')).toHaveLength(
      Math.min(12, TOTAL - 12),
    )
    expect(screen.getByTestId('location')).toHaveTextContent('pagina=2')

    await pickFilter('Setor', 'Banca')
    expect(screen.getByTestId('location')).not.toHaveTextContent('pagina')
    // One page of banks has no page navigation; more than one keeps it.
    expect(screen.queryByRole('navigation', { name: 'Páginas de empresas' }) !== null).toBe(BANKS.length > 12)
  })
})
