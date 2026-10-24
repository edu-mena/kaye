import { describe, expect, it } from 'vitest'
import { CAREER_SUMMARIES } from '../data/demo/careers'
import { SALARY_BANDS, findBand } from './bands'
import { filterCareers, normalize } from './careers'

const all = { query: '', group: null, sort: 'demand' as const, profile: null }

describe('careers search', () => {
  it('ignores accents and case', () => {
    expect(normalize('  Informática ')).toBe('informatica')
    expect(filterCareers(CAREER_SUMMARIES, { ...all, query: 'ciberseguranca' }).map((c) => c.slug)).toEqual([
      'analista-de-ciberseguranca',
    ])
  })

  it('needs every word to match', () => {
    expect(filterCareers(CAREER_SUMMARIES, { ...all, query: 'dados engenheiro' }).map((c) => c.slug)).toEqual(
      ['engenheiro-de-dados'],
    )
    expect(filterCareers(CAREER_SUMMARIES, { ...all, query: 'medicina' })).toEqual([])
  })

  it('filters by area', () => {
    const design = filterCareers(CAREER_SUMMARIES, { ...all, group: 'design' })
    expect(design.every((career) => career.group === 'design')).toBe(true)
    expect(design).toHaveLength(2)
  })
})

describe('careers filters', () => {
  it('filters by demand, salary band and whether the full guide exists', () => {
    const high = filterCareers(CAREER_SUMMARIES, { ...all, demand: 'alta' })
    expect(high.length).toBeGreaterThan(0)
    expect(high.every((career) => career.demand === 'alta')).toBe(true)

    const top = filterCareers(CAREER_SUMMARIES, { ...all, salary: findBand(SALARY_BANDS, 'mais500') })
    expect(top.every((career) => (career.salaryMedian ?? 0) > 500_000)).toBe(true)

    const guides = filterCareers(
      CAREER_SUMMARIES.map((career) => ({ ...career, detailed: career.slug === 'analista-de-dados' })),
      { ...all, guide: 'guia' },
    )
    expect(guides.map((career) => career.slug)).toEqual(['analista-de-dados'])
  })
})

describe('careers sorting', () => {
  it('puts high demand first, then the best paid', () => {
    const list = filterCareers(CAREER_SUMMARIES, all)
    expect(list[0]?.demand).toBe('alta')
    expect(list.at(-1)?.demand).toBe('baixa')
  })

  it('sorts by salary', () => {
    const salaries = filterCareers(CAREER_SUMMARIES, { ...all, sort: 'salary' }).map(
      (c) => c.salaryMedian ?? 0,
    )
    expect(salaries).toEqual(salaries.toSorted((a, b) => b - a))
  })

  it('sorts by fit with the person, when there is a test result', () => {
    const designer = CAREER_SUMMARIES.find((career) => career.slug === 'designer-grafico')!.riasec
    const list = filterCareers(CAREER_SUMMARIES, { ...all, sort: 'forYou', profile: designer })
    expect(list[0]?.slug).toBe('designer-grafico')
    // Without a profile the order is unchanged.
    const unsorted = filterCareers(CAREER_SUMMARIES, { ...all, sort: 'forYou' })
    expect(unsorted.map((c) => c.slug)).toEqual(CAREER_SUMMARIES.map((c) => c.slug))
  })
})
