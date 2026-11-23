import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SIMULATIONS } from '../../data/demo/simulations'
import type { Agent, SimulationMoment } from '../../data/types'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'

// No real agents exist yet: the tests bring one, to see the page and the authorship.
const agents = vi.hoisted(() => ({ list: [] as Agent[] }))
vi.mock('../../data/demo/agents', () => ({
  get AGENTS() {
    return agents.list
  },
}))

const { default: SimulationPage } = await import('./SimulationPage')
const { default: SimulationsPage } = await import('./SimulationsPage')
const { default: AgentPage } = await import('./AgentPage')
const { CareerSimulations } = await import('./CareerSimulations')

const NURSE = SIMULATIONS.find((simulation) => simulation.careerSlug === 'enfermeiro')!
const AGENT: Agent = {
  id: 'rita',
  name: 'Rita Gomes',
  role: 'Técnica de recursos humanos',
  area: 'health',
  verifiedBy: 'Eduardo',
  verifiedAt: '2026-11-20',
  company: 'Clínica Sagrada Esperança',
  consentAt: '2026-11-19',
}

beforeEach(() => {
  agents.list = []
  seedUser()
})

const open = (id: string) =>
  renderWithApp(<SimulationPage />, { route: `/simulacoes/${id}`, path: '/simulacoes/:id' })

const NEXT = /Continuar|O que esta profissão pede/

/** Chooses the second option of a decision and checks that what happens and why appear, and that Next was locked. */
async function decide(user: ReturnType<typeof userEvent.setup>, decision: SimulationMoment['decision']) {
  expect(screen.getByRole('button', { name: NEXT })).toBeDisabled()
  const option = decision!.options[1]!
  await user.click(screen.getByRole('button', { name: option.text }))
  expect(screen.getByText(option.result)).toBeInTheDocument()
  expect(screen.getByText(option.why)).toBeInTheDocument()
}

/** Walks the whole day, deciding at each decision, until the end. */
async function liveTheDay(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Começar o dia' }))
  for (const moment of NURSE.moments) {
    expect(await screen.findByRole('heading', { name: moment.title })).toBeInTheDocument()
    if (moment.decision) await decide(user, moment.decision)
    await user.click(screen.getByRole('button', { name: NEXT }))
  }
}

describe('the simulations catalogue', () => {
  it('has one simulation for each of the 13 areas, with 5 to 8 moments and 2 to 4 options per decision', () => {
    expect(SIMULATIONS).toHaveLength(13)
    expect(new Set(SIMULATIONS.map((simulation) => simulation.careerSlug)).size).toBe(13)
    for (const simulation of SIMULATIONS) {
      expect(simulation.moments.length).toBeGreaterThanOrEqual(5)
      expect(simulation.moments.length).toBeLessThanOrEqual(8)
      expect(new Set(simulation.moments.map((moment) => moment.id)).size).toBe(simulation.moments.length)
      const decisions = simulation.moments.filter((moment) => moment.decision)
      expect(decisions.length).toBeGreaterThanOrEqual(1)
      for (const { decision } of decisions) {
        expect(decision!.options.length).toBeGreaterThanOrEqual(2)
        expect(decision!.options.length).toBeLessThanOrEqual(4)
      }
      expect(simulation.example).toBe(true)
      expect(simulation.languages).toEqual(['pt'])
      expect(simulation.asks.length).toBeGreaterThan(0)
      expect(simulation.next.map((step) => step.kind)).toEqual(['course', 'academy', 'internship'])
    }
  })
})

describe('SimulationPage', () => {
  it('marks the simulation as an example, written by the Kayé team', async () => {
    open(NURSE.id)
    expect(await screen.findByRole('heading', { name: NURSE.title })).toBeInTheDocument()
    expect(screen.getByText('Exemplo, à espera de revisão por um profissional')).toBeInTheDocument()
    expect(screen.getByText('Escrita por Equipa Kayé')).toBeInTheDocument()
  })

  it('lives the day: a decision blocks the way on until chosen, then shows what happens and why', async () => {
    const user = userEvent.setup()
    open(NURSE.id)
    await liveTheDay(user)
    expect(await screen.findByRole('heading', { name: 'O que esta profissão pede' })).toBeInTheDocument()
    expect(screen.getByText(NURSE.asks[0]!)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'O passo seguinte' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Estágio' })).toHaveAttribute('href', '/estagios')
  })

  it('saves "gostei" in the interest profile, and a second answer replaces the first', async () => {
    const user = userEvent.setup()
    open(NURSE.id)
    await liveTheDay(user)
    await user.click(screen.getByRole('button', { name: 'Gostei' }))
    expect(screen.getByText(/vamos mostrar-te mais desta área/)).toBeInTheDocument()
    expect(getUser().simulations).toEqual([
      expect.objectContaining({ id: NURSE.id, careerSlug: 'enfermeiro', liked: true }),
    ])
    await user.click(screen.getByRole('button', { name: 'Não gostei' }))
    expect(getUser().simulations).toEqual([expect.objectContaining({ id: NURSE.id, liked: false })])
  })

  it('starts again from the intro', async () => {
    const user = userEvent.setup()
    open(NURSE.id)
    await liveTheDay(user)
    await user.click(screen.getByRole('button', { name: 'Voltar a viver este dia' }))
    expect(screen.getByRole('button', { name: 'Começar o dia' })).toBeInTheDocument()
  })

  it('links to the agent page when an agent wrote it, and shows who verified it', async () => {
    agents.list = [AGENT]
    const simulation = SIMULATIONS.find((entry) => entry.id === NURSE.id)!
    simulation.agentId = AGENT.id
    try {
      open(NURSE.id)
      const link = await screen.findByRole('link', { name: 'Escrita por Rita Gomes' })
      expect(link).toHaveAttribute('href', '/agentes/rita')
      expect(screen.getByText(/Verificado por Eduardo em 20 de novembro de 2026/)).toBeInTheDocument()
    } finally {
      delete simulation.agentId
    }
  })

  it('says when a simulation does not exist', async () => {
    open('nao-existe')
    expect(await screen.findByText('Simulação não encontrada')).toBeInTheDocument()
  })
})

describe('SimulationsPage', () => {
  it('lists the simulations of the areas the person chose, and the others with a click', async () => {
    seedUser({ interestAreas: ['health'] })
    const user = userEvent.setup()
    renderWithApp(<SimulationsPage />, { route: '/simulacoes' })
    expect(await screen.findByRole('link', { name: NURSE.title })).toBeInTheDocument()
    await vi.waitFor(() =>
      expect(screen.queryByRole('link', { name: /engenheiro de minas/ })).not.toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: 'Ver outras áreas' }))
    expect(await screen.findByRole('link', { name: /engenheiro de minas/ })).toBeInTheDocument()
  })

  it('filters by area and marks the ones already lived', async () => {
    seedUser({
      simulations: [{ id: NURSE.id, careerSlug: 'enfermeiro', liked: true, at: '2026-11-23T10:00:00.000Z' }],
    })
    renderWithApp(<SimulationsPage />, { route: '/simulacoes?area=health' })
    const list = await screen.findByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)
    expect(within(list).getByText('Gostaste')).toBeInTheDocument()
    expect(screen.getByText('Já viveste 1 dia')).toBeInTheDocument()
  })
})

describe('CareerSimulations', () => {
  it('offers the day on the career page, and nothing for a career without one', async () => {
    const { unmount } = renderWithApp(<CareerSimulations careerSlug="enfermeiro" careerName="Enfermeiro" />)
    expect(await screen.findByText('Vive um dia como Enfermeiro')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Viver este dia' })).toHaveAttribute(
      'href',
      `/simulacoes/${NURSE.id}`,
    )
    unmount()
    renderWithApp(<CareerSimulations careerSlug="medico-pediatra" careerName="X" />)
    expect(screen.queryByRole('link', { name: 'Viver este dia' })).not.toBeInTheDocument()
  })
})

describe('AgentPage', () => {
  it('shows only what the agent allowed, and who verified them', async () => {
    agents.list = [AGENT]
    renderWithApp(<AgentPage />, { route: '/agentes/rita', path: '/agentes/:id' })
    expect(await screen.findByRole('heading', { name: 'Rita Gomes' })).toBeInTheDocument()
    expect(screen.getByText(/Técnica de recursos humanos · Clínica Sagrada Esperança/)).toBeInTheDocument()
    expect(screen.getByText(/Verificado por Eduardo/)).toBeInTheDocument()
    expect(screen.getByText('Ainda não escreveu nenhuma simulação.')).toBeInTheDocument()
  })

  it('says when the agent does not exist', async () => {
    renderWithApp(<AgentPage />, { route: '/agentes/ninguem', path: '/agentes/:id' })
    expect(await screen.findByText('Agente não encontrado')).toBeInTheDocument()
  })
})
