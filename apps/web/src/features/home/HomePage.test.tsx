import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import { Layout } from '../../app/Layout'
import { renderWithApp } from '../../test/render'
import { answersFor, seedTested, seedUser } from '../../test/user'
import HomePage from './HomePage'

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
    expect(await screen.findAllByRole('link', { name: /Combina com o teu lado/ })).toHaveLength(3)
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
  it('has a skip link, the logo, both navigations and the demo notice', async () => {
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
    expect(screen.getByRole('main')).toHaveTextContent(/Demonstração/)
  })
})
