import { describe, expect, it } from 'vitest'
import { PROGRAMS } from '../data/demo/programs'
import type { Program } from '../data/types'
import { MIN_REVIEWS, rankPrograms, scorePrograms } from './ranking'

const base = PROGRAMS[0]!
const course = (change: Partial<Program>): Program => ({ ...base, ...change })

describe('scorePrograms', () => {
  it('ignores a rating with too few reviews and gives its weight to the others', () => {
    const [few] = scorePrograms([course({ id: 'few', rating: { average: 5, count: MIN_REVIEWS - 1 } })])
    const rating = few!.criteria.find((criterion) => criterion.key === 'rating')
    expect(rating).toMatchObject({ value: null, weight: 0 })
    const total = few!.criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
    expect(total).toBeCloseTo(1)
  })

  it('scores the cheapest course best on cost', () => {
    const scored = scorePrograms([
      course({ id: 'cheap', totalCost: 100 }),
      course({ id: 'dear', totalCost: 900 }),
    ])
    const cost = (index: number) =>
      scored[index]!.criteria.find((criterion) => criterion.key === 'cost')!.value
    expect(cost(0)).toBe(1)
    expect(cost(1)).toBe(0)
  })

  it('values evening and online schedules for people who work', () => {
    const [evening, daytime] = scorePrograms([
      course({ id: 'evening', schedule: ['pos_laboral'] }),
      course({ id: 'day', schedule: ['diurno'] }),
    ])
    expect(evening!.score).toBeGreaterThan(daytime!.score)
  })

  it('never uses the market criterion yet (Fase 2)', () => {
    for (const item of scorePrograms(PROGRAMS)) {
      expect(item.criteria.find((criterion) => criterion.key === 'market')?.value).toBeNull()
    }
  })
})

describe('rankPrograms', () => {
  const scored = scorePrograms(PROGRAMS)

  it('ranks only recognised courses and lists the others apart', () => {
    const { ranked, unrecognized } = rankPrograms(scored, 'score')
    expect(ranked.every((item) => item.program.recognized)).toBe(true)
    expect(unrecognized.map((item) => item.program.id)).toEqual(['bootcamp-frontend'])
  })

  it('sorts by score, price or rating', () => {
    const scores = rankPrograms(scored, 'score').ranked.map((item) => item.score)
    expect(scores).toEqual(scores.toSorted((a, b) => b - a))
    const prices = rankPrograms(scored, 'price').ranked.map((item) => item.program.totalCost ?? 0)
    expect(prices).toEqual(prices.toSorted((a, b) => a - b))
    const ratings = rankPrograms(scored, 'rating').ranked.map((item) => item.program.rating?.average ?? 0)
    expect(ratings).toEqual(ratings.toSorted((a, b) => b - a))
  })

  it('keeps the same score whatever the filter', () => {
    const everywhere = scored.find((item) => item.program.id === 'web-react')!.score
    const filtered = rankPrograms(
      scored.filter((item) => item.program.careers.includes('desenvolvedor-frontend')),
      'price',
    ).ranked.find((item) => item.program.id === 'web-react')!.score
    expect(filtered).toBe(everywhere)
  })
})
