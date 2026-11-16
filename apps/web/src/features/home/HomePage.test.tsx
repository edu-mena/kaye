import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'
import { Layout } from '../../app/Layout'
import { renderWithApp } from '../../test/render'
import { answersFor, seedTested, seedUser } from '../../test/user'
import HomePage from './HomePage'

// The layout registers the service worker (vite-plugin-pwa's virtual module): jsdom has none, and on Windows
// the virtual module does not even load. Here nothing is waiting to update.
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({ needRefresh: [false, () => {}], updateServiceWorker: async () => {} }),
}))

describe('HomePage', () => {
  it('welcomes people without a profile', () => {
    renderWithApp(<HomePage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Olá! Este é o Kayé' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Criar perfil' })).toHaveAttribute('href', '/entrar')
  })

  it('invites to the test, or to continue it', async () => {
    seedUser({ answers: { R1: 3, I1: 4 } })
    renderWithApp(<HomePage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Olá, Joana!' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /Continuar \(2 de 42\)/ })).toHaveAttribute(
      'href',
      '/teste',
    )
  })

  it('shows the code and the top careers after the test', async () => {
    seedTested()
    renderWithApp(<HomePage />)
    expect(await screen.findByText('IAC')).toBeInTheDocument()
    // After the test, "Carreiras para ti" are the six best matches, and "Ver tudo" opens the result.
    const tile = screen.getByRole('region', { name: 'Carreiras para ti' })
    expect(within(tile).getByRole('link', { name: 'Ver tudo' })).toHaveAttribute('href', '/teste/resultado')
    const careers = within(tile)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/carreiras/'))
    expect(careers).toHaveLength(6)
  })

  it('follows the destination: steps left and the next one', async () => {
    seedUser({ answers: answersFor(), targetCareer: 'desenvolvedor-frontend' })
    renderWithApp(<HomePage />)
    expect(await screen.findByRole('link', { name: 'Desenvolvedor Frontend' })).toHaveAttribute(
      'href',
      '/carreiras/desenvolvedor-frontend?secao=path',
    )
    expect(screen.getByText('Faltam 2 passos')).toBeInTheDocument()
    expect(screen.getByText('3 projetos publicados')).toBeInTheDocument()
  })

  it('suggests choosing a destination when there is none', () => {
    seedUser()
    renderWithApp(<HomePage />)
    expect(screen.getByText(/Escolhe uma profissão como destino/)).toBeInTheDocument()
  })
})

describe('Layout', () => {
  it('has a skip link, the logo and both navigations, and no demo notice over the screen', async () => {
    // Without a profile the layout is the bare one of the onboarding.
    seedUser()
    // ScrollRestoration needs a data router, like the real app's.
    const router = createMemoryRouter([
      { path: '/', Component: Layout, children: [{ index: true, element: <p>ecrã</p> }] },
    ])
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    expect(await screen.findByText('ecrã')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Saltar para o conteúdo' })).toHaveAttribute('href', '#conteudo')
    expect(screen.getAllByRole('img', { name: 'Kayé' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('navigation', { name: 'Navegação principal' })).toHaveLength(2)
    expect(screen.getByRole('main')).not.toHaveTextContent(/Demonstração/)
  })
})
