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
  it('lists the news newest first, each with its kind, date and page', async () => {
    renderWithApp(<NewsPage />)

    expect(await screen.findByRole('button', { name: `Tudo · ${NEWS.length}` })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(cards()).toHaveLength(NEWS.length)
    const first = within(cards()[0] as HTMLElement)
    expect(first.getByRole('link', { name: 'Mercado e Novidades' })).toHaveAttribute('href', '/mercado')
    expect(first.getByText('Do Kayé')).toBeInTheDocument()
    expect((cards()[0] as HTMLElement).querySelector('time')).toHaveAttribute('dateTime', NEWS[0]?.date)
  })

  it('marks made-up news as examples, and links real facts to their source', async () => {
    renderWithApp(<NewsPage />)

    const example = (await screen.findByRole('link', { name: /Universidade Pública Exemplo/ })).closest(
      'article',
    )
    expect(within(example as HTMLElement).getByText('Exemplo')).toBeInTheDocument()

    const bai = screen.getByRole('link', { name: /^Banco BAI:/ }).closest('article') as HTMLElement
    expect(within(bai).queryByText('Exemplo')).not.toBeInTheDocument()
    expect(within(bai).getByRole('link', { name: 'Fonte: Banco BAI' })).toHaveAttribute('target', '_blank')
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

    const filter = await screen.findByRole('button', { name: `Para ti · ${forYouCount}` })
    expect(
      within(screen.getByRole('region', { name: 'Para ti' })).getByText(/sobre as tuas carreiras/),
    ).toBeInTheDocument()

    await userEvent.click(filter)
    expect(cards()).toHaveLength(forYouCount)
    for (const card of cards()) expect(within(card).getByText('Para ti')).toBeInTheDocument()
  })
})
