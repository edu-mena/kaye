import { describe, expect, it } from 'vitest'
import { SIMULATIONS } from '../data/demo/simulations'
import type { Agent, CareerSummary } from '../data/types'
import { interestAreas } from './interests'
import {
  authorOf,
  decisionMoments,
  likedCareers,
  MAX_SIMULATIONS,
  resultOf,
  simulationsOf,
  withResult,
  type SimulationResult,
} from './simulations'

const result = (id: string, liked: boolean, careerSlug = 'enfermeiro'): SimulationResult => ({
  id,
  careerSlug,
  liked,
  at: '2026-11-23T10:00:00.000Z',
})

const NURSING = { slug: 'enfermeiro', group: 'enfermagem' } as CareerSummary
const MINING = { slug: 'engenheiro-de-minas', group: 'minas_geologia' } as CareerSummary

describe('simulations', () => {
  it('finds the simulations of a career and its decisions', () => {
    const [simulation] = simulationsOf(SIMULATIONS, 'enfermeiro')
    expect(simulation?.careerSlug).toBe('enfermeiro')
    expect(simulationsOf(SIMULATIONS, 'nao-existe')).toEqual([])
    expect(decisionMoments(simulation!).every((moment) => moment.decision !== undefined)).toBe(true)
  })

  it('shows no author while no agent wrote it', () => {
    const [simulation] = SIMULATIONS
    const agent = { id: 'rita' } as Agent
    expect(authorOf(simulation!, [agent])).toBeUndefined()
    expect(authorOf({ ...simulation!, agentId: 'rita' }, [agent])).toBe(agent)
  })

  it('keeps one answer per simulation, the newest first, and a limit', () => {
    const first = withResult([], result('a', true))
    const second = withResult(first, result('b', false))
    expect(second.map((entry) => entry.id)).toEqual(['b', 'a'])
    expect(withResult(second, result('a', false)).map((entry) => [entry.id, entry.liked])).toEqual([
      ['a', false],
      ['b', false],
    ])
    const many = Array.from({ length: MAX_SIMULATIONS }, (_, at) => result(`s${at}`, true))
    expect(withResult(many, result('novo', true))).toHaveLength(MAX_SIMULATIONS)
    expect(resultOf(second, 'a')?.liked).toBe(true)
    expect(resultOf(second, 'z')).toBeUndefined()
  })

  it('counts only the careers whose day the person liked', () => {
    expect(likedCareers([result('a', true), result('b', false, 'jurista'), result('c', true)])).toEqual([
      'enfermeiro',
    ])
  })
})

describe('the interest profile and the simulations', () => {
  const user = { discovery: null, interestAreas: ['technology' as const], savedCareers: [] }

  it('adds the area of a career whose day the person liked, after the areas they chose', () => {
    const liked = { ...user, simulations: [result('a', true)] }
    expect(interestAreas(liked, [NURSING, MINING])).toEqual(['technology', 'health'])
  })

  it('ignores a day the person did not like', () => {
    const disliked = { ...user, simulations: [result('a', false)] }
    expect(interestAreas(disliked, [NURSING, MINING])).toEqual(['technology'])
    expect(interestAreas(user, [NURSING, MINING])).toEqual(['technology'])
  })
})
