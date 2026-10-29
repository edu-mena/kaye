import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopBar } from '../../components/Navigation'
import { NEWS } from '../../data/demo/news'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import NotificationsPage from './NotificationsPage'

const mine = NEWS.filter((item) => item.careers?.includes('analista-de-dados'))

describe('NotificationsPage', () => {
  it('shows the next step and, without saved careers, how to get news', async () => {
    seedUser()
    renderWithApp(<NotificationsPage />)

    const next = await screen.findByRole('region', { name: 'Fazer o teste vocacional' })
    expect(within(next).getByRole('link', { name: /Começar/ })).toHaveAttribute('href', '/teste')
    expect(screen.getByText(/Guarda carreiras ou escolhe um destino/)).toBeInTheDocument()
  })

  it('lists the news about the saved careers, marks the unseen ones and clears the bell', async () => {
    seedUser({ savedCareers: ['analista-de-dados'], notificationsSeenAt: null })
    const bell = renderWithApp(<TopBar />)
    expect(
      await screen.findByRole('link', { name: `Notificações: ${mine.length} novas` }),
    ).toBeInTheDocument()
    bell.unmount()

    renderWithApp(<NotificationsPage />)
    const list = await screen.findByRole('list', { name: 'Novidades sobre as tuas carreiras' })
    expect(within(list).getAllByRole('article')).toHaveLength(mine.length)
    expect(within(list).getAllByText('Nova')).toHaveLength(mine.length)
    expect(getUser().notificationsSeenAt).not.toBeNull()
  })
})
