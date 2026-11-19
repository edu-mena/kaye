import { RouterProvider, createMemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Layout } from '../app/Layout'
import { SaveCompany } from '../features/companies/SaveCompany'
import { closeAccountPrompt } from '../state/accountGate'
import { getUser } from '../state/userStore'
import { renderWithApp } from '../test/render'
import { seedUser } from '../test/user'
import { AccountPrompt } from './AccountPrompt'
import { SignInButton } from './SignInButton'

const accounts = vi.hoisted(() => ({ on: true }))
const beginSignIn = vi.hoisted(() => vi.fn<(next?: string) => void>())

vi.mock('../data/account', async (original) => ({
  ...(await original<typeof import('../data/account')>()),
  get ACCOUNTS() {
    return accounts.on
  },
}))
vi.mock('../app/AppStatus', () => ({ AppStatus: () => null }))
vi.mock('../state/accountSync', async (original) => ({
  ...(await original<typeof import('../state/accountSync')>()),
  beginSignIn,
}))

beforeEach(() => {
  accounts.on = true
  beginSignIn.mockClear()
  closeAccountPrompt()
})

describe('SignInButton', () => {
  it('goes straight to Google with accounts, remembering where to come back', async () => {
    renderWithApp(<SignInButton next="/carreiras" />)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(beginSignIn).toHaveBeenCalledWith('/carreiras')
  })

  it('opens the onboarding where there are no accounts (the demo site)', () => {
    accounts.on = false
    renderWithApp(<SignInButton />)
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/entrar')
    expect(beginSignIn).not.toHaveBeenCalled()
  })
})

function renderLayout(route: string) {
  const router = createMemoryRouter(
    [
      {
        Component: Layout,
        children: [
          { index: true, handle: { bare: true }, element: <p>landing</p> },
          { path: 'carreiras', element: <p>catálogo</p> },
        ],
      },
    ],
    { initialEntries: [route] },
  )
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('exploring without an account', () => {
  it('shows a page of the catalogue with the app bars and an Entrar button, not a redirect to sign-up', () => {
    renderLayout('/carreiras')
    expect(screen.getByText('catálogo')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Entrar' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0)
  })

  it('keeps the landing page bare, without the app bars', () => {
    renderLayout('/')
    expect(screen.getByText('landing')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('does not show the Entrar button to someone who has a profile', () => {
    seedUser()
    renderLayout('/carreiras')
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument()
  })
})

describe('asking for the account when someone saves', () => {
  it('opens the prompt and saves nothing without a profile', async () => {
    renderWithApp(
      <>
        <SaveCompany id="sonangol" name="Sonangol" compact />
        <AccountPrompt />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: /Sonangol/ }))

    expect(screen.getByRole('dialog', { name: 'Guarda no Kayé' })).toBeVisible()
    expect(getUser().savedCompanies).toEqual([])
    await userEvent.click(screen.getByRole('button', { name: /Já tenho conta/ }))
    expect(beginSignIn).toHaveBeenCalled()
  })

  it('saves at once, with no prompt, for someone with a profile', async () => {
    seedUser()
    renderWithApp(
      <>
        <SaveCompany id="sonangol" name="Sonangol" compact />
        <AccountPrompt />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: /Sonangol/ }))

    expect(getUser().savedCompanies).toEqual(['sonangol'])
    expect(screen.queryByRole('dialog', { name: 'Guarda no Kayé' })).not.toBeInTheDocument()
  })
})
