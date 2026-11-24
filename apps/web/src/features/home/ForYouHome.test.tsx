import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedTested, seedUser } from '../../test/user'
import HomePage from './HomePage'

/** The challenge needs a few careers in full from the catalogue: give it time on a busy machine. */
const findChallenge = () => screen.findByRole('group', { name: 'Escolhe uma resposta' }, { timeout: 10_000 })

const today = () => new Date().toLocaleDateString('sv-SE')
const daysAgo = (count: number) => {
  const day = new Date()
  day.setDate(day.getDate() - count)
  return day.toLocaleDateString('sv-SE')
}
const adult = {
  name: 'Ana',
  birthYear: 1990,
  province: 'Luanda',
  education: 'licenciatura' as const,
  guardianInformed: false,
}
const minor = {
  name: 'Rui',
  birthYear: 2010,
  province: 'Luanda',
  education: 'ii_ciclo' as const,
  guardianInformed: true,
}

describe('the home «Para ti»', () => {
  it('greets the person and always says the next step, which is the same as the journey', async () => {
    seedUser()
    renderWithApp(<HomePage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Olá, Joana!' })).toBeInTheDocument()
    const hero = screen.getByRole('region', { name: 'Olá, Joana!' })
    expect(within(hero).getByRole('link', { name: /Fazer o teste vocacional/ })).toHaveAttribute(
      'href',
      '/teste',
    )
    const journey = screen.getByRole('region', { name: 'A tua jornada' })
    expect(within(journey).getByText('Estás aqui')).toBeInTheDocument()
    expect(within(journey).getAllByRole('link')[0]).toHaveAttribute('href', '/teste')
  })

  it('moves on with the person: after the test, the strengths', async () => {
    seedTested()
    renderWithApp(<HomePage />)
    const hero = await screen.findByRole('region', { name: 'Olá, Joana!' })
    expect(within(hero).getByRole('link', { name: /Completa as tuas valências/ })).toHaveAttribute(
      'href',
      '/teste/valencias',
    )
  })

  it('shows no streak at the start, and does not count the visit to the home', () => {
    seedUser()
    renderWithApp(<HomePage />)
    const streak = screen.getByRole('region', { name: 'Começa a tua sequência hoje' })
    expect(within(streak).getByText('Faz uma coisa hoje e mantém a tua sequência.')).toBeInTheDocument()
    expect(getUser().activity ?? []).toEqual([])
  })

  it('counts the days in a row, with the week for screen readers', () => {
    seedUser({ activity: [daysAgo(2), daysAgo(1), today()] })
    renderWithApp(<HomePage />)
    const streak = screen.getByRole('region', { name: '3 dias seguidos' })
    expect(within(streak).getByText('Hoje já contou. Volta amanhã.')).toBeInTheDocument()
    expect(within(streak).getByRole('list', { name: 'Esta semana' }).children).toHaveLength(7)
    expect(within(streak).getAllByText(/: feito$/).length).toBeGreaterThanOrEqual(1)
  })

  it('asks the challenge as a group of radio buttons, shows the right answer and gives the XP', async () => {
    seedUser({ profile: adult })
    renderWithApp(<HomePage />)
    const challenge = await findChallenge()
    const options = within(challenge).getAllByRole('radio')
    expect(options.length).toBeGreaterThanOrEqual(2)
    expect(options.every((option) => !(option as HTMLInputElement).checked)).toBe(true)

    await userEvent.click(options[0] as HTMLElement)

    expect(getUser().daily?.[today()]).toMatchObject({ picked: 0 })
    expect(getUser().activity).toEqual([today()])
    expect(await screen.findByText(/\+(20|30) XP/)).toBeInTheDocument()
    expect(screen.getByText('Amanhã há outro desafio.')).toBeInTheDocument()
    // It is not a quiz to retry: the options close.
    expect(
      within(challenge)
        .getAllByRole('radio')
        .every((option) => (option as HTMLInputElement).disabled),
    ).toBe(true)
  })

  it('does not blame who is wrong', async () => {
    seedUser({ profile: adult })
    renderWithApp(<HomePage />)
    const challenge = await findChallenge()
    for (const option of within(challenge).getAllByRole('radio')) await userEvent.click(option)
    expect(document.body).not.toHaveTextContent(/perdeste|vais perder|falhaste|errado/i)
  })

  it('never asks a minor how much someone earns', async () => {
    seedUser({ profile: minor })
    renderWithApp(<HomePage />)
    await findChallenge()
    expect(screen.queryByText(/Quanto ganha/)).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /Kz/ })).not.toBeInTheDocument()
  })

  it('names the area of the news, and "Ver tudo" opens them filtered by it', async () => {
    seedUser({ interestAreas: ['technology'] })
    renderWithApp(<HomePage />)
    const news = await screen.findByRole('region', { name: 'Novidades na tua área' })
    expect(within(news).getByText('Tecnologia e telecomunicações')).toBeInTheDocument()
    expect(within(news).getByRole('link', { name: 'Ver tudo' })).toHaveAttribute(
      'href',
      '/novidades?area=technology',
    )
  })

  it('marks the news as seen when a piece is opened', async () => {
    seedUser({ interestAreas: [] })
    renderWithApp(<HomePage />)
    const news = await screen.findByRole('region', { name: 'Novidades' })
    await waitFor(() => expect(within(news).getAllByRole('link').length).toBeGreaterThan(1))
    const pieces = within(news)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/novidades/'))
    expect(pieces.length).toBeGreaterThan(0)
    expect(getUser().newsSeenAt ?? null).toBeNull()

    await userEvent.click(pieces[0] as HTMLElement)

    expect(getUser().newsSeenAt).not.toBeNull()
  })

  it('has just "Novidades", with no area, when nobody said what they like', async () => {
    seedUser({ interestAreas: [] })
    renderWithApp(<HomePage />)
    expect(await screen.findByRole('region', { name: 'Novidades' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Novidades na tua área' })).not.toBeInTheDocument()
  })

  it('does not repeat in the feed the news the highlight shows', async () => {
    seedUser({ interestAreas: [] })
    renderWithApp(<HomePage />)
    const news = await screen.findByRole('region', { name: 'Novidades' })
    await waitFor(() => expect(within(news).getAllByRole('link').length).toBeGreaterThan(1))
    const shown = within(news)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href) => href?.startsWith('/novidades/'))
    const feed = screen.getByRole('region', { name: 'Para ti' })
    for (const article of within(feed).queryAllByRole('article')) {
      for (const link of within(article).queryAllByRole('link')) {
        expect(shown).not.toContain(link.getAttribute('href'))
      }
    }
  })
})

describe('the feed', () => {
  it('is a labelled section of articles, with filters that say which one is on', async () => {
    seedTested({ interestAreas: ['technology'] })
    renderWithApp(<HomePage />)
    const feed = await screen.findByRole('region', { name: 'Para ti' })
    await waitFor(() => expect(within(feed).getAllByRole('article').length).toBeGreaterThan(0))
    const filters = within(feed).getByRole('group', { name: 'O que queres ver' })
    const all = within(filters).getByRole('button', { name: 'Tudo' })
    expect(all).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(within(filters).getByRole('button', { name: 'Prazos' }))

    expect(within(filters).getByRole('button', { name: 'Prazos' })).toHaveAttribute('aria-pressed', 'true')
    expect(all).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows why a card is there', async () => {
    seedTested({ interestAreas: ['technology'], targetCareer: 'desenvolvedor-frontend' })
    renderWithApp(<HomePage />)
    expect((await screen.findAllByText('É a tua carreira-destino')).length).toBeGreaterThan(0)
  })

  it('hides a card for good with "Não me interessa"', async () => {
    seedTested({ interestAreas: ['technology'] })
    renderWithApp(<HomePage />)
    const feed = await screen.findByRole('region', { name: 'Para ti' })
    await waitFor(() => expect(within(feed).getAllByRole('article').length).toBeGreaterThan(0))
    const first = within(feed).getAllByRole('button', { name: 'Não me interessa' })[0] as HTMLElement
    const card = first.closest('article')

    await userEvent.click(first)

    expect(getUser().dismissed).toHaveLength(1)
    expect(getUser().dismissed?.[0]).toMatch(/^[a-zA-Z]+(:.+)?$/)
    expect(card).not.toBeInTheDocument()
  })

  it('saves a career from its card, which counts for the streak', async () => {
    seedTested({ interestAreas: ['technology'] })
    renderWithApp(<HomePage />)
    const feed = await screen.findByRole('region', { name: 'Para ti' })
    const save = await within(feed).findAllByRole('button', { name: 'Guardar' })

    await userEvent.click(save[0] as HTMLElement)

    expect(getUser().savedCareers).toHaveLength(1)
    expect(getUser().activity).toEqual([today()])
    expect(within(feed).getAllByRole('button', { name: 'Retirar dos guardados' }).length).toBeGreaterThan(0)
  })

  it('has no Plus card while the Plus is off', async () => {
    seedTested({ profile: adult, interestAreas: ['technology'] })
    renderWithApp(<HomePage />)
    await screen.findByRole('region', { name: 'Para ti' })
    expect(screen.queryByText('1.999 Kz por mês')).not.toBeInTheDocument()
  })

  it('has the Plus card for an adult when it is on, and never for a minor', async () => {
    vi.stubEnv('VITE_PLUS_ENABLED', 'true')
    seedTested({ profile: adult, interestAreas: ['technology'] })
    const first = renderWithApp(<HomePage />)
    await screen.findByRole('region', { name: 'Para ti' })
    expect(screen.getAllByText('1.999 Kz por mês').length).toBeGreaterThan(0)
    first.unmount()

    seedTested({ profile: minor, interestAreas: ['technology'] })
    renderWithApp(<HomePage />)
    await screen.findByRole('region', { name: 'Para ti' })
    expect(screen.queryByText('1.999 Kz por mês')).not.toBeInTheDocument()
  })
})
