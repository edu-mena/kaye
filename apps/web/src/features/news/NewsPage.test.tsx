import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NEWS } from '../../data/demo/news'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import NewsPage from './NewsPage'

const cards = () => screen.getAllByRole('article')
const forYouCount = NEWS.filter((item) => item.careers?.includes('analista-de-dados')).length

describe('NewsPage', () => {
  it('lists the news newest first, each with its kind, date and its own page', async () => {
    renderWithApp(<NewsPage />)

    expect(await screen.findByRole('button', { name: `Tudo · ${NEWS.length}` })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(cards()).toHaveLength(NEWS.length)
    const dates = cards().map((card) => card.querySelector('time')?.getAttribute('dateTime') ?? '')
    expect(dates).toEqual(dates.toSorted().toReversed())

    const newest = NEWS.find((item) => item.date === dates[0])
    const first = within(cards()[0] as HTMLElement)
    expect(first.getByRole('link', { name: (name) => name.includes(newest?.title ?? '?') })).toHaveAttribute(
      'href',
      expect.stringMatching(/^[/]novidades[/]/),
    )
  })

  it('shows no made-up news: every piece is a real fact', () => {
    expect(NEWS.filter((item) => item.example)).toEqual([])
  })

  it('narrows to one kind of news', async () => {
    renderWithApp(<NewsPage />)

    await userEvent.click(await screen.findByRole('button', { name: /^Empresas · \d+$/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('?tipo=empresas')
    expect(cards().every((card) => within(card).queryByText('Empresas'))).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: /^Tudo/ }))
    expect(cards()).toHaveLength(NEWS.length)
  })

  it('invites to save careers when there is nothing to make news personal', async () => {
    renderWithApp(<NewsPage />)

    const forYou = await screen.findByRole('region', { name: 'Para ti' })
    expect(within(forYou).getByRole('link', { name: /Ver carreiras/ })).toHaveAttribute('href', '/carreiras')
    expect(screen.queryByRole('button', { name: /^Para ti/ })).not.toBeInTheDocument()
  })

  it('picks out the news about the careers the person saved', async () => {
    seedUser({ savedCareers: ['analista-de-dados'] })
    renderWithApp(<NewsPage />)

    // With something for the person, "Para ti" is the default: their news first, then the rest.
    const filter = await screen.findByRole('button', { name: `Para ti · ${forYouCount}` })
    expect(filter).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(screen.getByRole('region', { name: 'Para ti' })).getByText(/das tuas carreiras/),
    ).toBeInTheDocument()
    expect(cards()).toHaveLength(NEWS.length)
    for (const card of cards().slice(0, forYouCount))
      expect(within(card).getByText('Para ti')).toBeInTheDocument()
    expect(within(cards()[forYouCount] as HTMLElement).queryByText('Para ti')).not.toBeInTheDocument()
  })
})
