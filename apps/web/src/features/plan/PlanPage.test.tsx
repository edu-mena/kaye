import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedTested, seedUser } from '../../test/user'
import PlanPage from './PlanPage'

const CYBER = 'analista-de-ciberseguranca'
const today = new Date().toISOString().slice(0, 10)

describe('PlanPage', () => {
  it('starts a plan from a career and a path, then shows its steps by phase', async () => {
    seedTested()
    renderWithApp(<PlanPage />, { route: '/plano' })
    expect(await screen.findByRole('heading', { name: 'Que carreira queres seguir?' })).toBeInTheDocument()

    await screen.findByRole('option', { name: 'Analista de Cibersegurança' })
    await userEvent.selectOptions(screen.getByLabelText('Outra carreira'), CYBER)
    expect(await screen.findByRole('heading', { name: 'Por que caminho?' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Começar o plano/ }))

    expect(getUser().plan).toMatchObject({ career: CYBER, done: [] })
    expect(getUser().targetCareer).toBe(CYBER)
    expect(await screen.findByRole('heading', { name: 'Esta semana' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'O plano completo' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Completa o teu CV a 100%' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /^Preparar/ })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Simula uma entrevista da área' })[0]).toBeInTheDocument()
  })

  it('ticks a step, counts it and unticks it', async () => {
    seedUser({ plan: { career: CYBER, pathway: '', done: [], startedAt: today } })
    renderWithApp(<PlanPage />, { route: '/plano' })
    await screen.findByRole('heading', { name: 'O plano completo' })

    const all = screen.getByRole('heading', { name: 'O plano completo' }).closest('section') as HTMLElement
    const first = within(all).getAllByRole('button', { name: 'Marcar como feito' })[0] as HTMLElement
    await userEvent.click(first)
    expect(getUser().plan?.done).toHaveLength(1)
    expect(screen.getByText(/^1 de \d+ passos feitos$/)).toBeInTheDocument()

    await userEvent.click(within(all).getAllByRole('button', { name: 'Desmarcar' })[0] as HTMLElement)
    expect(getUser().plan?.done).toEqual([])
  })

  it('closes the practice steps on its own when the app saw them done', async () => {
    const at = `${today}T10:00:00.000Z`
    seedUser({
      plan: { career: CYBER, pathway: '', done: [], startedAt: today },
      psychotech: [{ at } as never],
      interviews: [{ at } as never],
    })
    renderWithApp(<PlanPage />, { route: '/plano' })
    await screen.findByRole('heading', { name: 'O plano completo' })
    expect(screen.getAllByText('Feito: a app viu')).toHaveLength(2)
  })

  it('changes career and can cancel, or clears the plan', async () => {
    seedUser({ plan: { career: CYBER, pathway: '', done: [], startedAt: today } })
    renderWithApp(<PlanPage />, { route: '/plano' })
    await userEvent.click(await screen.findByRole('button', { name: /Mudar de carreira ou caminho/ }))
    expect(await screen.findByText(/o que marcaste começa do zero/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(await screen.findByRole('heading', { name: 'Esta semana' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Apagar o plano/ }))
    expect(getUser().plan).toBeNull()
    expect(await screen.findByRole('heading', { name: 'Que carreira queres seguir?' })).toBeInTheDocument()
  })

  it('opens the picker on the career of the link, and marks the saved careers', async () => {
    seedUser({ savedCareers: [CYBER] })
    renderWithApp(<PlanPage />, { route: `/plano?carreira=${CYBER}` })
    expect(await screen.findByText('As tuas carreiras')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Analista de Cibersegurança' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
