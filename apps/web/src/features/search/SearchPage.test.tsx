import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import SearchPage from './SearchPage'

const failing = vi.hoisted(() => ({ companies: false }))
vi.mock('../../data/source', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../data/source')>()
  return {
    ...actual,
    listCompanies: async () => {
      if (failing.companies) throw new Error('down')
      return actual.listCompanies()
    },
  }
})

// What "dados" finds in the catalogue today: 7 careers, 1 scholarship, 2 companies and 2 pages of the app.
const ALL_DADOS = '12 resultados para «dados»'

const field = () => screen.getByRole('searchbox', { name: 'Pesquisar no Kayé' })
const count = () => screen.getByText(/resultados? para/)

describe('SearchPage', () => {
  it('is ready to type, and offers the four sections before anything is searched', () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa' })

    expect(field()).toHaveFocus()
    const explore = screen.getByRole('region', { name: 'Explorar' })
    expect(
      within(explore)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '/carreiras',
      '/cursos',
      '/academias',
      '/oportunidades?tab=bolsas',
      '/oportunidades?tab=estagios',
      '/empresas',
    ])
    expect(screen.queryByRole('region', { name: 'Pesquisas recentes' })).not.toBeInTheDocument()
  })

  it('finds careers, scholarships and companies at once, a few of each, with the words marked', async () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa' })
    await userEvent.type(field(), 'dados')

    expect(await screen.findByText(ALL_DADOS)).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/pesquisa?q=dados')
    const careers = screen.getByRole('region', { name: /^Carreiras/ })
    expect(within(careers).getAllByRole('link')).toHaveLength(4)
    expect(within(careers).getByRole('link', { name: /Analista de Dados/ })).toHaveAttribute(
      'href',
      '/carreiras/analista-de-dados',
    )
    expect(within(careers).getAllByText('Dados', { selector: 'mark' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('region', { name: /^Empresas/ })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /^Academias/ })).not.toBeInTheDocument()
    // A type with no results is not offered as a filter.
    expect(screen.queryByRole('button', { name: /^Academias/ })).not.toBeInTheDocument()

    await userEvent.click(within(careers).getByRole('button', { name: 'Ver todos (7)' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/pesquisa?q=dados&tipo=carreiras')
    expect(count()).toHaveTextContent('7 resultados para «dados»')
    expect(
      screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/carreiras/')),
    ).toHaveLength(7)
  })

  it('narrows to one type and back to all of them', async () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=dados' })

    await userEvent.click(await screen.findByRole('button', { name: 'Empresas · 2' }))
    expect(count()).toHaveTextContent('2 resultados para «dados»')
    expect(screen.getByRole('button', { name: 'Empresas · 2' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'Tudo · 12' }))
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/pesquisa\?q=dados$/)
  })

  it('ignores accents and capitals', async () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=SEGURANCA' })
    expect(await screen.findByRole('link', { name: /Analista de Cibersegurança/ })).toBeInTheDocument()
  })

  it('says when nothing matches, and points to the sections', async () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=xyzzy' })

    expect(await screen.findByText('Nada encontrado para «xyzzy»')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Explorar' })).toBeInTheDocument()
  })

  it('says nothing matches when the address asks for a type without results', async () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=dados&tipo=academias' })

    expect(await screen.findByText('Nada encontrado para «dados»')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Academias · 0' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows a long list a page at a time', async () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=a&tipo=carreiras' })

    const pages = await screen.findByRole('navigation', { name: 'Páginas de resultados' })
    expect(
      screen.getAllByRole('listitem').filter((item) => item.querySelector('a[href^="/carreiras/"]')),
    ).toHaveLength(12)
    await userEvent.click(within(pages).getByRole('button', { name: 'Página 2' }))
    expect(screen.getByTestId('location')).toHaveTextContent('pagina=2')
  })

  it('keeps the searches the person used: with Enter, or by opening a result', async () => {
    renderWithApp(<SearchPage />, { route: '/pesquisa' })

    await userEvent.type(field(), 'redes{Enter}')
    expect(getUser().searches).toEqual(['redes'])

    await userEvent.clear(field())
    await userEvent.type(field(), 'dados')
    await userEvent.click(await screen.findByRole('link', { name: /Analista de Dados/ }))
    expect(getUser().searches).toEqual(['dados', 'redes'])
  })

  it('searches again from a recent search, and forgets them all on request', async () => {
    seedUser({ searches: ['redes', 'dados'] })
    renderWithApp(<SearchPage />, { route: '/pesquisa' })
    const recent = screen.getByRole('region', { name: 'Pesquisas recentes' })

    await userEvent.click(within(recent).getByRole('button', { name: 'dados' }))
    expect(field()).toHaveValue('dados')
    expect(await screen.findByText(ALL_DADOS)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Limpar a pesquisa' }))
    expect(field()).toHaveValue('')
    expect(field()).toHaveFocus()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(getUser().searches).toEqual([])
    expect(screen.queryByRole('region', { name: 'Pesquisas recentes' })).not.toBeInTheDocument()
  })

  it('follows the address when it changes from outside, such as a link to Pesquisa', async () => {
    renderWithApp(
      <>
        <SearchPage />
        <Link to="/pesquisa">Pesquisa</Link>
      </>,
      { route: '/pesquisa?q=dados' },
    )
    expect(field()).toHaveValue('dados')
    expect(field()).not.toHaveFocus()

    await userEvent.click(screen.getByRole('link', { name: 'Pesquisa' }))
    expect(field()).toHaveValue('')
    expect(screen.getByRole('region', { name: 'Explorar' })).toBeInTheDocument()
  })

  it('offers to try again when the data does not arrive', async () => {
    failing.companies = true
    renderWithApp(<SearchPage />, { route: '/pesquisa?q=dados' })

    const retry = await screen.findByRole('button', { name: 'Tentar outra vez' })
    failing.companies = false
    await userEvent.click(retry)
    expect(await screen.findByText(ALL_DADOS)).toBeInTheDocument()
  })
})
