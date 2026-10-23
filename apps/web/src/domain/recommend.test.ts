import { describe, expect, it } from 'vitest'
import { CAREER_SUMMARIES } from '../data/demo/careers'
import type { CareerSummary, RiasecProfile } from '../data/types'
import { compatibility } from './riasec'
import { recommend } from './recommend'

const investigative: RiasecProfile = { R: 0.2, I: 1, A: 0.75, S: 0.5, E: 0.25, C: 0.75 }

describe('recommend', () => {
  it('returns the requested number, with reasons in order', () => {
    const list = recommend(investigative, CAREER_SUMMARIES, 5)
    expect(list).toHaveLength(5)
    expect(list[0]?.reasons[0]).toMatchObject({ kind: 'interest' })
  })

  it('never lets the market push a career that does not match', () => {
    const matching: CareerSummary = {
      ...CAREER_SUMMARIES[0]!,
      slug: 'fits',
      demand: 'baixa',
      salaryMedian: 100000,
      riasec: investigative,
    }
    const wellPaidMismatch: CareerSummary = {
      ...CAREER_SUMMARIES[0]!,
      slug: 'pays',
      demand: 'alta',
      salaryMedian: 2000000,
      riasec: { R: 0.9, I: 0.1, A: 0.1, S: 0.9, E: 0.9, C: 0.1 },
    }
    expect(compatibility(investigative, wellPaidMismatch.riasec)).toBeLessThan(0.55)

    const list = recommend(investigative, [wellPaidMismatch, matching], 2)
    expect(list.map((item) => item.career.slug)).toEqual(['fits', 'pays'])
  })

  it('explains high demand and good pay', () => {
    const top: CareerSummary = {
      ...CAREER_SUMMARIES[0]!,
      demand: 'alta',
      salaryMedian: 900000,
      riasec: investigative,
    }
    expect(recommend(investigative, [top], 1)[0]?.reasons.map((reason) => reason.kind)).toEqual([
      'interest',
      'demand',
      'salary',
    ])
  })
})
