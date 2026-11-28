import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import education from '../../data/market/education.json'
import jobs from '../../data/market/jobs.json'
import type { MarketWeek } from '../../data/types'
import { renderWithApp } from '../../test/render'
import MarketPage from './MarketPage'

const failing = vi.hoisted(() => ({ careers: false }))
const live = vi.hoisted(() => ({ week: null as MarketWeek | null }))
vi.mock('../../data/source', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../data/source')>()
  return {
    ...actual,
    listCareers: async () => {
      if (failing.careers) throw new Error('down')
      return actual.listCareers()
    },
    getMarketWeek: async () => live.week,
  }
})

const WEEK: MarketWeek = {
  from: '2026-11-21',
  to: '2026-11-27',
  postings: 132,
  previous: 120,
  areas: [
    { area: 'business', postings: 50 },
    { area: 'technology', postings: 33 },
    { area: 'other', postings: 20 },
  ],
  companies: [
    { name: 'Unitel', postings: 6 },
    { name: 'Empregador Desconhecido', postings: 2 },
  ],
  unnamed: [
    { source: 'jobartis', name: 'Jobartis', url: 'https://www.jobartis.com', postings: 40 },
    { source: 'whatsapp', name: 'WhatsApp', url: null, postings: 3 },
  ],
  agencies: { postings: 9, names: ['Kept People', 'Ascending'] },
  updated: '2026-11-27T10:15:00Z',
}

afterEach(() => {
  live.week = null
})

const region = (name: string | RegExp) => screen.findByRole('region', { name })
const open = (section: string) => renderWithApp(<MarketPage />, { route: `/mercado?secao=${section}` })

describe('MarketPage', () => {
  it('opens on the summary, and each fact leads to its tab', async () => {
    renderWithApp(<MarketPage />, { route: '/mercado' })

    expect(screen.getByRole('heading', { level: 1, name: 'Mercado' })).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: 'Resumo', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'O mercado em números' })).toBeInTheDocument()
    const publicFact = screen.getByRole('button', { name: /concursos públicos/ })
    expect(publicFact).toHaveTextContent(jobs.public.openings.toLocaleString('pt'))
    await userEvent.click(publicFact)
    expect(screen.getByRole('tab', { name: 'Estado', selected: true })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('secao=estado')
  })

  it('counts the job ads by month, area and province, and ranks the tech careers', async () => {
    open('vagas')

    const postings = await region('Vagas nos últimos 12 meses')
    expect(within(postings).getByText(jobs.postings.toLocaleString('pt'))).toBeInTheDocument()
    // In blocks of 3 months: the board's dates are estimated.
    expect(within(postings).getAllByRole('listitem')).toHaveLength(4)
    expect(within(await region('Vagas por área')).getAllByRole('listitem').length).toBeGreaterThan(3)
    expect(within(await region('Onde estão as vagas')).getByText('Luanda')).toBeInTheDocument()
    // The agencies are counted apart from the employers.
    const recruiters = await region('Quem mais recruta')
    expect(within(recruiters).queryByText(jobs.agencies.names[0] as string)).not.toBeInTheDocument()
    expect(within(recruiters).getByText(/agências de recrutamento/)).toBeInTheDocument()
    expect(within(await region('O que pedem as vagas')).getByText('Sem experiência')).toBeInTheDocument()
    expect(within(await region(/^Desemprego por idade/)).getAllByRole('listitem')).toHaveLength(6)
    const demanded = await region(/^Mais procuradas em tecnologia/)
    const [first] = within(demanded).getAllByRole('link', { name: /^(?!Ver todas)/ })
    expect(first?.getAttribute('href')).toMatch(/^\/carreiras\//)
    // No salaries in the Mercado: they are still example data.
    expect(screen.queryByText(/Kz/)).not.toBeInTheDocument()
    // The demo has no live facts: no week, rather than made-up numbers.
    expect(screen.queryByRole('region', { name: 'Vagas desta semana' })).not.toBeInTheDocument()
  })

  it("shows this week's job ads against the week before, and who posted most", async () => {
    live.week = WEEK
    open('vagas')

    const week = await region('Vagas desta semana')
    expect(within(week).getByText('132')).toBeInTheDocument()
    expect(within(week).getByText('+10% do que na semana anterior')).toBeInTheDocument()
    expect(within(week).getByText(/^De 21 .* a 27 .* atualizado de 3 em 3 horas$/)).toBeInTheDocument()
    expect(
      within(week).getByRole('heading', { level: 3, name: 'Quem recrutou esta semana' }),
    ).toBeInTheDocument()
    // A known employer links to its page; an unknown one is only its name.
    expect(within(week).getByRole('link', { name: /Unitel/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/empresas\//),
    )
    expect(within(week).getByText('Empregador Desconhecido').closest('a')).toBeNull()
    // By area, with each share of the week.
    const areas = within(week).getByRole('list', { name: 'Vagas de cada área nesta semana' })
    expect(within(areas).getAllByRole('listitem')).toHaveLength(3)
    expect(within(areas).getByText('Gestão, finanças e comércio')).toBeInTheDocument()
    expect(within(areas).getByText('50 · 38%')).toBeInTheDocument()
    expect(within(areas).getByText('Outras')).toBeInTheDocument()
    // The posts without a named employer point to the site that published them.
    expect(within(week).getByText(/não diz a empresa/)).toBeInTheDocument()
    expect(within(week).getByRole('link', { name: 'Jobartis' })).toHaveAttribute(
      'href',
      'https://www.jobartis.com',
    )
    expect(within(week).getByText('40 vagas')).toBeInTheDocument()
    expect(within(week).getByText('WhatsApp').closest('a')).toBeNull()
    expect(
      within(week).getByText('E 9 vagas de agências de recrutamento (Kept People, Ascending).'),
    ).toBeInTheDocument()
  })

  it('says when the week fell or held, and leaves out what it does not have', async () => {
    live.week = { ...WEEK, postings: 90, companies: [], unnamed: [], agencies: { postings: 0, names: [] } }
    const { unmount } = open('vagas')

    const fell = await region('Vagas desta semana')
    expect(within(fell).getByText('−25% do que na semana anterior')).toBeInTheDocument()
    expect(within(fell).queryByText('Quem recrutou esta semana')).not.toBeInTheDocument()
    unmount()

    live.week = { ...WEEK, postings: 120 }
    const held = open('vagas')
    expect(
      within(await region('Vagas desta semana')).getByText('Tantas como na semana anterior'),
    ).toBeInTheDocument()
    held.unmount()

    // Without a week before, or before the collection covers all of it (null), there is nothing to compare.
    for (const previous of [0, null]) {
      live.week = { ...WEEK, previous }
      const view = open('vagas')
      const week = await region('Vagas desta semana')
      expect(within(week).getByText('132')).toBeInTheDocument()
      expect(within(week).queryByText(/semana anterior/)).not.toBeInTheDocument()
      view.unmount()
    }
  })

  it('leaves the week out when no job ad arrived', async () => {
    live.week = { ...WEEK, postings: 0 }
    open('vagas')

    expect(await region('Vagas por área')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Vagas desta semana' })).not.toBeInTheDocument()
  })

  it('shows the public competitions and who opens them', async () => {
    open('estado')

    const competitions = await region('Concursos públicos')
    expect(within(competitions).getByText(jobs.public.openings.toLocaleString('pt'))).toBeInTheDocument()
    const bodies = within(await region('Quem abre mais lugares')).getAllByRole('listitem')
    expect(bodies).toHaveLength(jobs.public.bodies.length)
    expect(within(await region('Lugares por área')).getByText('Educação')).toBeInTheDocument()
    const official = await region('Confirmados no Diário da República')
    expect(within(official).getAllByRole('listitem')).toHaveLength(jobs.public.official.competitions.length)
    expect(within(official).getByRole('link', { name: /AngoLEX/ })).toHaveAttribute(
      'href',
      'https://angolex.com',
    )
  })

  it('shows the graduates per course and per year, with their sources', async () => {
    open('formacao')

    expect(within(await region('Diplomados por curso')).getAllByRole('listitem')).toHaveLength(8)
    expect(within(await region('A estudar agora, por curso')).getAllByRole('listitem')).toHaveLength(8)
    const access = await region(/^Entrar no ensino superior/)
    expect(within(access).getByText(education.access.candidates.toLocaleString('pt'))).toBeInTheDocument()
    const series = await region('Diplomados por ano')
    expect(within(series).getAllByRole('link', { name: /^Fonte:/ }).length).toBeGreaterThan(0)
  })

  it('puts each area side by side, with no verdict, and the sources under it', async () => {
    open('areas')

    const table = await screen.findByRole('table', { name: /Cada área/ })
    expect(
      within(table).getByRole('columnheader', { name: `Diplomados (${education.year})` }),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('columnheader', { name: 'Concursos públicos (lugares)' }),
    ).toBeInTheDocument()
    expect(within(table).getAllByRole('rowheader').length).toBeGreaterThan(5)
    expect(screen.queryByText(/Falta formação|Equilibrada|Formação a mais/)).not.toBeInTheDocument()
    const sources = screen.getByText(/^Vagas de /).closest('div') as HTMLElement
    for (const source of jobs.sources) {
      expect(within(sources).getByText(source.name).closest('a')).toHaveAttribute('href', source.url)
    }
  })

  it('offers to try again when the data does not arrive', async () => {
    failing.careers = true
    open('vagas')

    const retry = await screen.findByRole('button', { name: 'Tentar outra vez' })
    failing.careers = false
    await userEvent.click(retry)
    expect(await region('Vagas por área')).toBeInTheDocument()
  })
})
