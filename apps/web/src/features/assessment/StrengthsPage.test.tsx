import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedTested, seedUser } from '../../test/user'
import StrengthsPage from './StrengthsPage'

const SLOW = { timeout: 30000 }

/** The toggle row of one item (Segmented: a fieldset named by its legend). */
const row = (name: string) => screen.getByRole('group', { name })
const pick = (group: string, option: string) =>
  userEvent.click(within(row(group)).getByRole('button', { name: option }))
const next = () => userEvent.click(screen.getByRole('button', { name: /^Seguinte/ }))

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

describe('StrengthsPage', () => {
  it('goes through every step, saving each answer, and ends on the result', SLOW, async () => {
    seedTested({ kursos: { programacao: { certificate: 'KY-1234', completedAt: '2026-11-01' } as never } })
    renderWithApp(<StrengthsPage />, { route: '/teste/valencias' })

    // Languages: a level, cleared by pressing it again; "Outra" asks for its name.
    expect(await screen.findByRole('heading', { name: 'Que línguas falas?' })).toBeInTheDocument()
    await pick('Inglês', 'Intermédio')
    expect(getUser().strengths.languages).toEqual([{ id: 'en', level: 'intermediate' }])
    await pick('Inglês', 'Intermédio')
    expect(getUser().strengths.languages).toEqual([])
    await pick('Outra', 'Básico')
    await userEvent.type(screen.getByLabelText('Qual?'), 'Suaíli')
    expect(getUser().strengths.languages).toEqual([{ id: 'other', level: 'basic', name: 'Suaíli' }])
    await next()

    expect(await screen.findByRole('heading', { name: 'Competências digitais' })).toBeInTheDocument()
    await pick('Excel', 'Sei fazer')
    expect(getUser().strengths.digital).toEqual({ excel: 'sei' })
    await pick('Excel', 'Sei fazer')
    expect(getUser().strengths.digital).toEqual({})
    await next()

    expect(
      await screen.findByRole('heading', { name: 'Ofícios e competências técnicas' }),
    ).toBeInTheDocument()
    const area = await screen.findByRole('group', { name: 'Área' })
    await userEvent.click(within(area).getAllByRole('button')[1] as HTMLElement)
    const more = screen.queryByRole('button', { name: /^Mostrar mais/ })
    if (more) await userEvent.click(more)
    const skill = screen.getAllByRole('group').find((group) => group !== area)
    await userEvent.click(within(skill as HTMLElement).getByRole('button', { name: 'Domino' }))
    expect(Object.values(getUser().skills)).toEqual(['domino'])
    await next()

    expect(await screen.findByRole('heading', { name: 'Competências transversais' })).toBeInTheDocument()
    await pick('Liderança', 'Ponto forte')
    await userEvent.click(screen.getByLabelText('Pôr no CV'))
    expect(getUser().strengths.softInCv).toEqual(['leadership'])
    await userEvent.click(screen.getByLabelText('Pôr no CV'))
    expect(getUser().strengths.softInCv).toEqual([])
    await pick('Liderança', 'Ponto forte')
    expect(getUser().strengths.soft).toEqual({})
    await next()

    expect(await screen.findByRole('heading', { name: 'O que já fizeste' })).toBeInTheDocument()
    expect(screen.getByText(/KY-1234/)).toBeInTheDocument()
    await pick('Tipo', 'Estágio')
    expect(screen.getByPlaceholderText('Ex.: Estágio na contabilidade')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Adicionar/ })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('O quê'), 'Estágio no BAI')
    await userEvent.type(screen.getByLabelText('Onde'), 'Luanda')
    await userEvent.type(screen.getByLabelText('Quando'), '2025')
    await userEvent.click(screen.getByRole('button', { name: /Adicionar/ }))
    expect(getUser().strengths.experience).toMatchObject([
      { kind: 'internship', what: 'Estágio no BAI', where: 'Luanda', when: '2025' },
    ])
    expect(screen.getByText('Luanda · 2025')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remover Estágio no BAI' }))
    expect(getUser().strengths.experience).toEqual([])
    await next()

    expect(await screen.findByRole('heading', { name: 'Como gostas de trabalhar' })).toBeInTheDocument()
    await pick('Onde preferes trabalhar?', 'No terreno')
    await pick('O que preferes?', 'Estabilidade')
    await userEvent.click(screen.getByLabelText('Criar coisas'))
    expect(getUser().strengths.work).toMatchObject({ place: 'field', security: 'stable', values: ['create'] })
    await userEvent.click(screen.getByLabelText('Criar coisas'))
    expect(getUser().strengths.work.values).toEqual([])
    await next()

    expect(await screen.findByRole('heading', { name: 'As tuas condições' })).toBeInTheDocument()
    await pick('Até onde queres estudar?', 'Licenciatura')
    await pick('Podes estudar fora da tua província?', 'Sim')
    await pick('Precisas de começar a trabalhar já?', 'Não')
    expect(getUser().strengths.conditions).toEqual({ study: 'degree', move: true, workNow: false })
    await pick('Podes estudar fora da tua província?', 'Sim')
    expect(getUser().strengths.conditions.move).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /Ver o resultado/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/teste/resultado')
    expect(getUser().strengths.done).toHaveLength(7)
  })

  it('opens on the first step not done, goes back, and skips', async () => {
    seedUser({ strengths: { ...getUser().strengths, done: ['languages', 'digital'] } })
    renderWithApp(<StrengthsPage />, { route: '/teste/valencias' })
    expect(await screen.findByText('Passo 3 de 7')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver já o resultado' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }))
    expect(screen.getByText('Passo 2 de 7')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Saltar' }))
    expect(screen.getByText('Passo 3 de 7')).toBeInTheDocument()
  })

  it('without part 1 done, the end leads to the test', async () => {
    seedUser({
      strengths: {
        ...getUser().strengths,
        done: ['languages', 'digital', 'trades', 'soft', 'experience', 'work'],
      },
    })
    renderWithApp(<StrengthsPage />, { route: '/teste/valencias' })
    await userEvent.click(await screen.findByRole('button', { name: /Ver o resultado/ }))
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/teste$/)
  })
})
