import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'
import { Layout } from '../../app/Layout'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
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
