import { describe, expect, it } from 'vitest'
import type { Career, CareerGroup, CareerSummary, Demand } from '../data/types'
import { dailyCandidates, dailyChallenge, type DailyInput } from './daily'

const GROUPS: CareerGroup[] = ['desenvolvimento', 'dados', 'infraestrutura', 'seguranca', 'telecomunicacoes']
const DEMANDS: Demand[] = ['alta', 'media', 'baixa']

const careers: CareerSummary[] = Array.from({ length: 12 }, (_, index) => ({
  slug: `carreira-${index}`,
  name: `Carreira ${index}`,
  group: GROUPS[index % GROUPS.length] as CareerGroup,
  summary: '',
  riasec: { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 },
  demand: DEMANDS[index % DEMANDS.length] as Demand,
  salaryMedian: 150_000 + index * 40_000,
  detailed: true,
}))

const detail = (summary: CareerSummary, months: number): Career =>
  ({
    ...summary,
    pathways: [
      {
        id: 'via',
        name: 'Via',
        summary: '',
        totalCost: null,
        steps: [
          {
            kind: 'formacao',
            title: 'Curso',
            description: '',
            months: { min: months, max: months },
            need: 'essencial',
          },
        ],
      },
    ],
  }) as unknown as Career

const bySlug = (slug: string) => careers.find((career) => career.slug === slug)

const details = careers.slice(0, 4).map((career, index) => detail(career, 12 + index * 6))

const input = (date: string, change: Partial<DailyInput> = {}): DailyInput => ({
  date,
  careers,
  details,
  showSalaries: true,
  ...change,
})

/** Thirty days, to see every kind of question. */
const DAYS = Array.from({ length: 30 }, (_, index) => `2026-11-${String(index + 1).padStart(2, '0')}`)

describe('dailyChallenge', () => {
  it('is the same for the same date and input, whatever the number of times it is asked', () => {
    for (const date of DAYS) expect(dailyChallenge(input(date))).toEqual(dailyChallenge(input(date)))
  })

  it('changes from one day to the next', () => {
    const questions = new Set(DAYS.map((date) => JSON.stringify(dailyChallenge(input(date)))))
    expect(questions.size).toBeGreaterThan(10)
  })

  it('has three options, one of them the right one, for every kind of question', () => {
    const kinds = new Set<string>()
    for (const date of DAYS) {
      const challenge = dailyChallenge(input(date))
      expect(challenge).not.toBeNull()
      if (!challenge) continue
      kinds.add(challenge.kind)
      expect(challenge.options).toHaveLength(challenge.kind === 'demand' ? 2 : 3)
      expect(challenge.options[challenge.answer]).toBeDefined()
      expect(challenge.careers.length).toBeGreaterThan(0)
    }
    expect(kinds).toEqual(new Set(['salary', 'demand', 'time']))
  })

  it('has a right answer that is true: the median for a salary, the higher demand, the quickest path', () => {
    type Check = { kind: string; ok: boolean }
    const checks = DAYS.flatMap((date): Check[] => {
      const challenge = dailyChallenge(input(date))
      const right = challenge?.options[challenge.answer]
      if (!challenge || !right) return []
      if (challenge.kind === 'salary' && right.kind === 'kz') {
        const salary = bySlug(challenge.careers[0] ?? '')?.salaryMedian ?? 0
        return [{ kind: challenge.kind, ok: Math.abs(right.value - salary) <= 5_000 }]
      }
      if (challenge.kind === 'demand') {
        // DEMANDS goes from high (0) to low (2): the right option has the smaller index.
        const [first, second] = challenge.careers.map((slug) =>
          DEMANDS.indexOf(bySlug(slug)?.demand ?? 'baixa'),
        )
        return [{ kind: challenge.kind, ok: challenge.answer === ((first ?? 0) < (second ?? 0) ? 0 : 1) }]
      }
      if (challenge.kind === 'time' && right.kind === 'months') {
        const step = details.find((career) => career.slug === challenge.careers[0])?.pathways[0]?.steps[0]
        return [{ kind: challenge.kind, ok: right.value === step?.months?.min }]
      }
      return [{ kind: challenge.kind, ok: false }]
    })
    expect(new Set(checks.map((check) => check.kind))).toEqual(new Set(['salary', 'demand', 'time']))
    expect(checks.filter((check) => !check.ok)).toEqual([])
  })

  it('never asks a minor about salaries', () => {
    for (const date of DAYS) {
      const challenge = dailyChallenge(input(date, { showSalaries: false }))
      expect(challenge).not.toBeNull()
      expect(challenge?.kind).not.toBe('salary')
      expect(challenge?.options.some((option) => option.kind === 'kz')).toBe(false)
    }
  })

  it('asks for a kind it has data for when the first one has none', () => {
    const noDetails = DAYS.map((date) => dailyChallenge(input(date, { details: [] })))
    expect(noDetails.every((challenge) => challenge !== null && challenge.kind !== 'time')).toBe(true)
    const noSalaries = DAYS.map((date) =>
      dailyChallenge(input(date, { careers: careers.map((career) => ({ ...career, salaryMedian: null })) })),
    )
    expect(noSalaries.every((challenge) => challenge !== null && challenge.kind !== 'salary')).toBe(true)
  })

  it('is null when the catalogue cannot make a question', () => {
    expect(dailyChallenge(input('2026-11-24', { careers: [], details: [] }))).toBeNull()
  })
})

describe('dailyCandidates', () => {
  it('names the same few careers on a given date', () => {
    const base = { date: '2026-11-24', careers }
    expect(dailyCandidates(base)).toEqual(dailyCandidates(base))
    expect(dailyCandidates(base).length).toBeGreaterThan(0)
    expect(dailyCandidates(base).length).toBeLessThanOrEqual(4)
    expect(dailyCandidates({ date: '2026-11-24', careers: [] })).toEqual([])
  })
})
